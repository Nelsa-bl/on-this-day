import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { translations } from '../../utils/translations/translations';
import { categorizeEvent } from '../../utils/events/eventMeta';
import { getCategoryIcon } from '../../utils/events/categoryBadge';
import { generateShareCardBlob } from '../../utils/share/shareCardImage';
import Spinner from '../../components/spinner/spinner.component';
import noImage from '../../assets/no_image.jpg';
import './eventDetails.style.scss';

const EventDetails = ({
  language,
  events,
  isLoading: isLoadingList,
  appError,
}) => {
  const { type, pageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(location.state?.event ?? null);
  const [wikiPage] = useState(location.state?.wikiPage ?? null);
  const [isLoading, setIsLoading] = useState(!event);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isLoadingYearArticle, setIsLoadingYearArticle] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [randomYearArticle, setRandomYearArticle] = useState(null);
  const [yearArticleRefreshKey, setYearArticleRefreshKey] = useState(0);

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

  const toWikiUrl = (title) => {
    const clean = (title || '').trim().replace(/ /g, '_');
    if (!clean) return '';
    const lang = language || 'en';
    return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(clean)}`;
  };

  const openExternal = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
      } catch {
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
  const numericYear = Number(primaryYear);
  const yearsAgo = Number.isFinite(numericYear)
    ? Math.max(0, new Date().getFullYear() - numericYear)
    : null;
  const categoryKey = event ? categorizeEvent(event) : '';
  const categoryIcon = getCategoryIcon(categoryKey);
  const primaryUrl =
    page?.content_urls?.desktop?.page ||
    page?.content_urls?.mobile?.page ||
    wikiPage?.contentUrl ||
    '';

  useEffect(() => {
    const targetYear = Number(primaryYear);
    if (!Number.isFinite(targetYear)) {
      setRandomYearArticle(null);
      return;
    }
    let isMounted = true;

    const loadRandomYearArticle = async () => {
      try {
        setIsLoadingYearArticle(true);
        const langCandidates = [language, language === 'bs' ? 'sr' : null].filter(
          Boolean,
        );

        for (const lang of langCandidates) {
          const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
            String(targetYear),
          )}&srlimit=30&srnamespace=0&format=json&origin=*`;
          const searchRes = await fetch(searchUrl);
          if (!searchRes.ok) continue;
          const searchData = await searchRes.json();
          const results = (searchData?.query?.search || []).filter((item) => {
            const title = item?.title || '';
            return title && title !== primaryTitle;
          });
          if (!results.length) continue;

          const randomResult =
            results[Math.floor(Math.random() * results.length)];
          const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            randomResult.title,
          )}`;
          const summaryRes = await fetch(summaryUrl);
          if (!summaryRes.ok) continue;
          const summaryData = await summaryRes.json();
          const contentUrl =
            summaryData?.content_urls?.desktop?.page ||
            summaryData?.content_urls?.mobile?.page ||
            '';
          if (!contentUrl) continue;

          if (!isMounted) return;
          setRandomYearArticle({
            title: summaryData?.title || randomResult.title,
            extract: summaryData?.extract || randomResult?.snippet || '',
            contentUrl,
          });
          return;
        }

        if (isMounted) setRandomYearArticle(null);
      } catch {
        if (isMounted) setRandomYearArticle(null);
      } finally {
        if (isMounted) setIsLoadingYearArticle(false);
      }
    };

    loadRandomYearArticle();
    return () => {
      isMounted = false;
    };
  }, [language, pageId, primaryTitle, primaryYear, yearArticleRefreshKey]);
  const shareDateLabel = new Date().toLocaleDateString(
    language === 'bs' ? 'sr-RS' : 'en-US',
    { day: '2-digit', month: 'short', year: 'numeric' },
  );

  const handleShareCard = async () => {
    if (isSharing) return;
    try {
      setIsSharing(true);
      const blob = await generateShareCardBlob({
        title: primaryTitle,
        year: primaryYear,
        dateLabel: shareDateLabel,
        categoryLabel: t[categoryKey] || categoryKey,
      });

      const file = new File([blob], `on-this-day-${primaryYear || 'event'}.png`, {
        type: 'image/png',
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: primaryTitle,
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `on-this-day-${primaryYear || 'event'}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err?.name === 'AbortError') return;
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading || isLoadingList) return <Spinner />;

  if (appError || error) {
    return (
      <div className='event-details'>
        <div className='event-details__header'>
          <button className='event-details__back' onClick={() => navigate(-1)}>
            {t.backToList}
          </button>
        </div>
        <p className='event-details__error'>{appError || error}</p>
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
          <div className='event-details__meta'>
            {primaryYear ? <h4 className='event-details__year'>{primaryYear}</h4> : <span />}
            <div className='event-details__meta-tags'>
              {yearsAgo != null ? (
                <span className='event-details__meta-tag'>
                  {yearsAgo} {t.yearsAgo}
                </span>
              ) : null}
              {categoryKey ? (
                <span
                  className={`event-details__meta-tag event-details__meta-tag--category event-details__meta-tag--${categoryKey}`}
                >
                  <svg
                    className='event-details__meta-tag-icon'
                    viewBox={categoryIcon.viewBox}
                    aria-hidden='true'
                  >
                    {categoryIcon.paths.map((path) => (
                      <path key={path} d={path} />
                    ))}
                  </svg>
                  {t[categoryKey] || categoryKey}
                </span>
              ) : null}
            </div>
          </div>

          <div className='event-details__hero-wrap'>
            <img
              className='event-details__hero'
              alt={primaryTitle}
              src={primaryImage || noImage}
            />
          </div>

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
                    onClick={() =>
                      window.open(primaryUrl, '_blank', 'noopener,noreferrer')
                    }
                  >
                    {t.readFullArticle}
                  </button>
                ) : null}
              </div>
              <button
                className='event-details__share-inline event-details__share-inline--centered'
                onClick={handleShareCard}
                disabled={isSharing}
                type='button'
              >
                <svg viewBox='0 0 24 24' aria-hidden='true'>
                  <path d='M18 16a3 3 0 0 0-2.39 1.19l-6.41-3.2a2.9 2.9 0 0 0 0-1.98l6.41-3.2A3 3 0 1 0 15 7a2.9 2.9 0 0 0 .06.58l-6.41 3.2a3 3 0 1 0 0 2.44l6.41 3.2A3 3 0 1 0 18 16Z' />
                </svg>
                {isSharing ? t.generatingShare : t.shareCard}
              </button>
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
                openExternal(toWikiUrl(relatedTitle));
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
                openExternal(related.contentUrl || toWikiUrl(related.title));
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

          <section className='event-details__year-article'>
            <h3 className='event-details__related-title'>{t.yearArticle}</h3>
            {isLoadingYearArticle ? (
              <div className='event-details__related-loading'>
                <Spinner variant='inline' />
              </div>
            ) : null}
            {!isLoadingYearArticle && !randomYearArticle ? (
              <p className='event-details__related-empty'>{t.noYearArticle}</p>
            ) : null}
            {randomYearArticle ? (
              <button
                className='event-details__year-article-card'
                onClick={() =>
                  window.open(
                    randomYearArticle.contentUrl,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                <strong>{randomYearArticle.title}</strong>
                {randomYearArticle.extract ? <p>{randomYearArticle.extract}</p> : null}
                <span>{t.readYearArticle}</span>
              </button>
            ) : null}
            {randomYearArticle ? (
              <button
                className='event-details__year-randomize'
                onClick={() => setYearArticleRefreshKey((prev) => prev + 1)}
              >
                {t.randomFromYear}
              </button>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default EventDetails;
