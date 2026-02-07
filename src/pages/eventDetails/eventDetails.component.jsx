import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { translations } from '../../utils/translations/translations';
import Spinner from '../../components/spinner/spinner.component';
import noImage from '../../assets/no_image.jpg';
import './eventDetails.style.scss';

const EventDetails = ({ language, events, isLoading: isLoadingList }) => {
  const { type, pageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(location.state?.event ?? null);
  const [wikiPage] = useState(location.state?.wikiPage ?? null);
  const [isLoading, setIsLoading] = useState(!event);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  const t = translations[language] || translations.bs;

  useEffect(() => {
    if (event) return;
    if (isLoadingList) return;

    const list = events?.[type] || [];
    const found = list.find((item) =>
      item.pages?.some((page) => String(page.pageid) === String(pageId)),
    );

    if (!found) {
      setError('Event not found.');
    } else {
      setEvent(found);
    }
    setIsLoading(false);
  }, [event, events, isLoadingList, pageId, type]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageId, type]);

  const relatedPages = useMemo(() => {
    if (!event?.pages?.length) return [];
    return event.pages.slice(1, 4);
  }, [event]);
  const eventTypeLabel = t[type] || type;
  const page = event?.pages?.[0];

  useEffect(() => {
    let isMounted = true;
    const title =
      wikiPage?.title ||
      page?.titles?.normalized ||
      page?.normalizedtitle ||
      null;
    if (!title) return () => {};

    const loadRelated = async () => {
      try {
        setIsLoadingRelated(true);
        const baseTitle = title.replace(/_/g, ' ');
        const lang = language || 'en';
        const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          baseTitle,
        )}&srlimit=4&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const searchResults = searchData?.query?.search || [];
        const candidates = searchResults.slice(1, 4);

        const summaries = await Promise.all(
          candidates.map(async (item) => {
            const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
              item.title,
            )}`;
            const summaryRes = await fetch(summaryUrl);
            const summary = await summaryRes.json();
            return {
              pageid: item.pageid,
              title: item.title,
              extract: summary?.extract || '',
              thumbnail: summary?.thumbnail?.source || '',
              description: summary?.description || '',
              contentUrl:
                summary?.content_urls?.desktop?.page ||
                summary?.content_urls?.mobile?.page ||
                '',
            };
          }),
        );

        if (isMounted) setRelatedArticles(summaries);
      } catch (err) {
        if (isMounted) setRelatedArticles([]);
      } finally {
        if (isMounted) setIsLoadingRelated(false);
      }
    };

    loadRelated();
    return () => {
      isMounted = false;
    };
  }, [language, page, wikiPage]);

  const primaryTitle =
    page?.titles?.normalized || wikiPage?.title || 'Unknown title';
  const primaryImage = page?.thumbnail?.source || wikiPage?.thumbnail || '';
  const primaryDescription = page?.description || wikiPage?.description || '';
  const primaryExtract = page?.extract || wikiPage?.extract || '';
  const primaryText = event?.text || '';
  const primaryYear = event?.year || '';
  const primaryUrl =
    page?.content_urls?.mobile?.page || wikiPage?.contentUrl || '';

  if (isLoading || isLoadingList) return <Spinner />;

  if (error) {
    return (
      <div className='event-details'>
        <div className='event-details__header'>
          <button className='event-details__back' onClick={() => navigate(-1)}>
            {t.backToList}
          </button>
        </div>
        <p className='event-details__error'>{error}</p>
      </div>
    );
  }

  return (
    <div className='event-details'>
      <div className='event-details__header'>
        <button className='event-details__back' onClick={() => navigate(-1)}>
          {t.backToList}
        </button>
        <span className='event-details__type'>{eventTypeLabel}</span>
      </div>

      <div className='event-details__body'>
        <div className='left'>
          <h1 className='event-details__title'>{primaryTitle}</h1>
          {primaryYear ? (
            <h4 className='event-details__year'>{primaryYear}</h4>
          ) : null}

          {primaryImage ? (
            <img
              className='event-details__image'
              alt={primaryTitle}
              src={primaryImage}
            />
          ) : (
            <img
              className='event-details__image'
              alt='Not available'
              src={noImage}
            />
          )}

          {primaryDescription ? (
            <span className='event-details__desc'>{primaryDescription}</span>
          ) : null}
          {primaryText ? (
            <p className='event-details__text'>
              <b>{primaryText}</b>
            </p>
          ) : null}
          {primaryExtract ? (
            <p className='event-details__extract'>{primaryExtract}</p>
          ) : null}

          <div className='event-details__content'>
            <div className='event-details__main'>
              <div className='event-details__actions'>
                <button
                  className='event-details__back'
                  onClick={() => navigate(-1)}
                >
                  {t.backToList}
                </button>
                {primaryUrl ? (
                  <button
                    className='event-details__read'
                    onClick={() => window.open(primaryUrl, '_blank')}
                  >
                    {t.readFullArticle}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className='event-details__related'>
          <h3 className='event-details__related-title'>{t.related}</h3>
          {relatedPages.length === 0 && relatedArticles.length === 0 ? (
            <p className='event-details__related-empty'>{t.noRelations}</p>
          ) : null}
          {relatedPages.map((related) => (
            <button
              key={`event-${related.pageid}`}
              className='event-details__related-card'
              onClick={() => {
                const relatedTitle =
                  related?.titles?.normalized || related?.normalizedtitle || '';
                const wikiTitle = relatedTitle.replace(/ /g, '_');
                const lang = language || 'en';
                if (wikiTitle) {
                  window.open(
                    `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
                      wikiTitle,
                    )}`,
                    '_blank',
                  );
                }
              }}
            >
              <div
                className='event-details__related-image'
                style={{
                  backgroundImage: `url(${
                    related?.thumbnail?.source || noImage
                  })`,
                }}
              />
              <div className='event-details__related-body'>
                <h4 className='event-details__related-headline'>
                  {related?.titles?.normalized}
                </h4>
                <p className='event-details__related-text'>
                  {related?.extract}
                </p>
              </div>
            </button>
          ))}
          {isLoadingRelated ? (
            <div className='event-details__related-loading'>
              <Spinner variant='inline' />
            </div>
          ) : null}
          {relatedArticles.map((related) => (
            <button
              key={`search-${related.pageid}`}
              className='event-details__related-card'
              onClick={() => {
                const wikiTitle = (related.title || '').replace(/ /g, '_');
                const lang = language || 'en';
                if (wikiTitle) {
                  window.open(
                    `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
                      wikiTitle,
                    )}`,
                    '_blank',
                  );
                }
              }}
            >
              <div
                className='event-details__related-image'
                style={{
                  backgroundImage: `url(${related.thumbnail || noImage})`,
                }}
              />
              <div className='event-details__related-body'>
                <h4 className='event-details__related-headline'>
                  {related.title}
                </h4>
                <p className='event-details__related-text'>{related.extract}</p>
              </div>
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default EventDetails;
