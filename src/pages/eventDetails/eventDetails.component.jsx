import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { translations } from '../../utils/translations/translations';
import {
  categorizeEvent,
  getCategoryClassification,
  getPrimaryPage,
} from '../../utils/events/eventMeta';
import { getCategoryIcon } from '../../utils/events/categoryBadge';
import { generateShareCardBlob } from '../../utils/share/shareCardImage';
import Skeleton from '../../components/skeleton/skeleton.component';
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
  const searchParams = new URLSearchParams(location.search);
  const routeLangParam = (searchParams.get('lang') || '').toLowerCase();
  const routeLanguage = /^[a-z-]{2,5}$/.test(routeLangParam)
    ? routeLangParam
    : '';
  const resolvedLanguage = routeLanguage || language || 'en';
  const routeYear = searchParams.get('year') || '';
  const [event, setEvent] = useState(location.state?.event ?? null);
  const [wikiPage] = useState(location.state?.wikiPage ?? null);
  const [fallbackPage, setFallbackPage] = useState(null);
  const [isLoading, setIsLoading] = useState(!event);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
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

    const findFromList = () => {
      const list = events?.[type] || [];
      return (
        list.find((item) =>
          item.pages?.some((page) => String(page.pageid) === String(pageId)),
        ) || null
      );
    };

    const found = findFromList();
    if (found) {
      setEvent(found);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadFallbackByPageId = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiUrl = `https://${resolvedLanguage}.wikipedia.org/w/api.php?action=query&format=json&pageids=${encodeURIComponent(
          pageId,
        )}&prop=info|pageimages|extracts|pageterms&inprop=url&piprop=thumbnail|original&pithumbsize=1200&exintro=1&explaintext=1&redirects=1&origin=*`;
        const response = await fetch(apiUrl, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Fallback load failed with ${response.status}`);
        }
        const payload = await response.json();
        const pages = payload?.query?.pages || {};
        const page = pages?.[pageId] || Object.values(pages)[0] || null;

        if (!page || page.missing != null) {
          throw new Error('Page missing');
        }

        const normalizedTitle = page?.title || '';
        const contentUrl =
          page?.fullurl ||
          (normalizedTitle
            ? `https://${resolvedLanguage}.wikipedia.org/wiki/${encodeURIComponent(
                normalizedTitle,
              )}`
            : '');
        const normalizedPage = {
          pageid: page?.pageid ?? pageId,
          titles: { normalized: normalizedTitle },
          normalizedtitle: normalizedTitle,
          description: page?.terms?.description?.[0] || '',
          extract: page?.extract || '',
          thumbnail: page?.thumbnail?.source ? { source: page.thumbnail.source } : null,
          content_urls: contentUrl
            ? {
                desktop: { page: contentUrl },
                mobile: { page: contentUrl },
              }
            : null,
        };

        if (!isMounted) return;
        setFallbackPage(normalizedPage);
        setError(null);
      } catch (err) {
        if (!isMounted || err?.name === 'AbortError') return;
        setError('Event not found.');
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    loadFallbackByPageId();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [event, events, isLoadingList, pageId, resolvedLanguage, type]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageId, type]);

  const routeMatchedPage = useMemo(() => {
    if (!event?.pages?.length) return null;
    return (
      event.pages.find((item) => String(item?.pageid) === String(pageId)) || null
    );
  }, [event, pageId]);

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
  const page =
    routeMatchedPage ||
    wikiPage ||
    fallbackPage ||
    getPrimaryPage(event) ||
    event?.pages?.[0] ||
    null;
  const relatedPages = useMemo(() => {
    if (!event?.pages?.length) return [];
    const selectedPageId = String(page?.pageid || '');
    return event.pages
      .filter((item) => String(item?.pageid || '') !== selectedPageId)
      .slice(0, 3);
  }, [event, page]);

  useEffect(() => {
    let isMounted = true;
    const title =
      wikiPage?.title ||
      page?.titles?.normalized ||
      page?.normalizedtitle ||
      null;
    if (!title) {
      setRelatedArticles([]);
      setIsLoadingRelated(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingRelated(true);
    setRelatedArticles([]);

    const loadRelated = async () => {
      try {
        const baseTitle = title.replace(/_/g, ' ');
        const lang = resolvedLanguage;
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
  }, [resolvedLanguage, page, wikiPage]);

  const primaryTitle =
    page?.titles?.normalized || wikiPage?.title || 'Unknown title';
  const primaryImage = page?.thumbnail?.source || wikiPage?.thumbnail || '';
  const primaryDescription = page?.description || wikiPage?.description || '';
  const primaryExtract = page?.extract || wikiPage?.extract || '';
  const primaryText = event?.text || '';
  const primaryYear = event?.year || routeYear || '';
  const numericYear = Number(primaryYear);
  const yearsAgo = Number.isFinite(numericYear)
    ? Math.max(0, new Date().getFullYear() - numericYear)
    : null;
  const categoryKey = event ? categorizeEvent(event) : '';
  const categoryMeta = event
    ? getCategoryClassification(event)
    : { category: '', confidence: 0, source: '' };
  const categoryDebugTitle =
    process.env.NODE_ENV !== 'production'
      ? `${categoryMeta.category} | ${categoryMeta.source} | ${categoryMeta.confidence}`
      : undefined;
  const categoryIcon = getCategoryIcon(categoryKey);
  const primaryUrl =
    page?.content_urls?.desktop?.page ||
    page?.content_urls?.mobile?.page ||
    wikiPage?.contentUrl ||
    '';

  const handleBackToList = () => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }

    sessionStorage.setItem('forceListTop', '1');
    navigate('/', { replace: true });
  };

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
        const langCandidates = [
          resolvedLanguage,
          resolvedLanguage === 'bs' ? 'sr' : null,
        ].filter(Boolean);

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
  }, [
    pageId,
    primaryTitle,
    primaryYear,
    resolvedLanguage,
    yearArticleRefreshKey,
  ]);
  const shareDateLabel = new Date().toLocaleDateString(
    resolvedLanguage === 'bs' ? 'sr-RS' : 'en-US',
    { day: '2-digit', month: 'short', year: 'numeric' },
  );

  const handleShareCard = async () => {
    if (isSharing) return;
    try {
      setIsSharing(true);
      const detailUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      const sharePath =
        type && pageId
          ? `/share/event/${encodeURIComponent(type)}/${encodeURIComponent(pageId)}?${new URLSearchParams(
              {
                lang: resolvedLanguage,
                ...(primaryYear ? { year: String(primaryYear) } : {}),
              },
            ).toString()}`
          : '';
      const shareUrl = sharePath
        ? `${window.location.origin}${sharePath}`
        : detailUrl;
      const summarySource = primaryText || primaryExtract || primaryDescription || '';
      const cleanSummary = summarySource.replace(/\s+/g, ' ').trim();
      const summary =
        cleanSummary.length > 220
          ? `${cleanSummary.slice(0, 217).trimEnd()}...`
          : cleanSummary;
      const shareText = [
        primaryYear ? `${primaryYear} - ${primaryTitle}` : primaryTitle,
        summary,
      ]
        .filter(Boolean)
        .join('\n\n');

      if (navigator.share) {
        await navigator.share({
          title: primaryTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `${shareText}\n\n${shareUrl}`.trim(),
        );
        return;
      }

      const blob = await generateShareCardBlob({
        title: primaryTitle,
        year: primaryYear,
        dateLabel: shareDateLabel,
        categoryLabel: t[categoryKey] || categoryKey,
      });

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

  const handleRandomizeYearArticle = () => {
    if (isLoadingYearArticle) return;
    setRandomYearArticle(null);
    setIsLoadingYearArticle(true);
    setYearArticleRefreshKey((prev) => prev + 1);
  };

  const isPageLoading = isLoading || isLoadingList;

  if (!isPageLoading && (appError || error)) {
    return (
      <div className='event-details'>
        <div className='event-details__header'>
          <button className='event-details__back' onClick={handleBackToList}>
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
        <button className='event-details__back' onClick={handleBackToList}>
          {t.backToList}
        </button>
        <span className='event-details__type'>{eventTypeLabel}</span>
      </div>

      <div className='event-details__body'>
        <div className='left'>
          <h1 className='event-details__title'>
            {isPageLoading ? <Skeleton width='68%' height='30px' /> : primaryTitle}
          </h1>
          <div className='event-details__meta'>
            {isPageLoading ? (
              <h4 className='event-details__year'>
                <Skeleton width='52px' height='20px' />
              </h4>
            ) : primaryYear ? (
              <h4 className='event-details__year'>{primaryYear}</h4>
            ) : (
              <span />
            )}
            <div className='event-details__meta-tags'>
              {!isPageLoading && yearsAgo != null ? (
                <span className='event-details__meta-tag'>
                  {yearsAgo} {t.yearsAgo}
                </span>
              ) : null}
              {!isPageLoading && categoryKey ? (
                <span
                  className={`event-details__meta-tag event-details__meta-tag--category event-details__meta-tag--${categoryKey}`}
                  title={categoryDebugTitle}
                  data-category-source={categoryMeta.source}
                  data-category-confidence={String(categoryMeta.confidence)}
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
              {isPageLoading ? (
                <>
                  <span className='event-details__meta-tag' aria-hidden='true'>
                    <Skeleton variant='pill' width='84px' height='14px' />
                  </span>
                  <span className='event-details__meta-tag' aria-hidden='true'>
                    <Skeleton variant='pill' width='94px' height='14px' />
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className='event-details__hero-wrap'>
            {isPageLoading ? (
              <Skeleton variant='rect' width='100%' height='340px' />
            ) : (
              <img
                className='event-details__hero'
                alt={primaryTitle}
                src={primaryImage || noImage}
              />
            )}
          </div>

          {!isPageLoading && primaryDescription ? (
            <span className='event-details__desc'>{primaryDescription}</span>
          ) : null}
          {!isPageLoading && primaryText ? (
            <p className='event-details__text'>
              <b>{primaryText}</b>
            </p>
          ) : null}
          {!isPageLoading && primaryExtract ? (
            <p className='event-details__extract'>{primaryExtract}</p>
          ) : null}
          {isPageLoading ? (
            <div aria-hidden='true'>
              <Skeleton width='32%' height='14px' style={{ marginBottom: '10px' }} />
              <Skeleton width='100%' height='14px' style={{ marginBottom: '6px' }} />
              <Skeleton width='96%' height='14px' style={{ marginBottom: '6px' }} />
              <Skeleton width='92%' height='14px' style={{ marginBottom: '12px' }} />
              <Skeleton width='100%' height='12px' style={{ marginBottom: '6px' }} />
              <Skeleton width='98%' height='12px' style={{ marginBottom: '6px' }} />
              <Skeleton width='94%' height='12px' />
            </div>
          ) : null}

          <div className='event-details__content'>
            <div className='event-details__main'>
              <div className='event-details__actions'>
                {isPageLoading ? (
                  <>
                    <Skeleton variant='rect' width='100%' height='40px' />
                    <Skeleton variant='rect' width='100%' height='40px' />
                  </>
                ) : (
                  <button
                    className='event-details__back'
                    onClick={handleBackToList}
                  >
                    {t.backToList}
                  </button>
                )}
                {!isPageLoading && primaryUrl ? (
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
              {isPageLoading ? (
                <div className='event-details__share-inline event-details__share-inline--centered'>
                  <Skeleton width='90px' height='12px' />
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>

        <aside className='event-details__related'>
          <h3 className='event-details__related-title'>{t.related}</h3>
          {!isPageLoading &&
          !isLoadingRelated &&
          relatedPages.length === 0 &&
          relatedArticles.length === 0 ? (
            <p className='event-details__related-empty'>{t.noRelations}</p>
          ) : null}
          {!isPageLoading &&
            !isLoadingRelated &&
            relatedPages.map((related) => (
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
            <>
              <div className='event-details__related-card' aria-hidden='true'>
                <Skeleton variant='rect' width='72px' height='72px' />
                <div className='event-details__related-body'>
                  <Skeleton width='82%' height='14px' style={{ marginBottom: '7px' }} />
                  <Skeleton width='100%' height='12px' style={{ marginBottom: '6px' }} />
                  <Skeleton width='94%' height='12px' />
                </div>
              </div>
              <div className='event-details__related-card' aria-hidden='true'>
                <Skeleton variant='rect' width='72px' height='72px' />
                <div className='event-details__related-body'>
                  <Skeleton width='78%' height='14px' style={{ marginBottom: '7px' }} />
                  <Skeleton width='100%' height='12px' style={{ marginBottom: '6px' }} />
                  <Skeleton width='92%' height='12px' />
                </div>
              </div>
              <div className='event-details__related-card' aria-hidden='true'>
                <Skeleton variant='rect' width='72px' height='72px' />
                <div className='event-details__related-body'>
                  <Skeleton width='80%' height='14px' style={{ marginBottom: '7px' }} />
                  <Skeleton width='100%' height='12px' style={{ marginBottom: '6px' }} />
                  <Skeleton width='91%' height='12px' />
                </div>
              </div>
            </>
          ) : null}
          {!isPageLoading &&
            !isLoadingRelated &&
            relatedArticles.map((related) => (
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
          {isPageLoading ? (
            <>
              <div className='event-details__related-card' aria-hidden='true'>
                <Skeleton variant='rect' width='72px' height='72px' />
                <div className='event-details__related-body'>
                  <Skeleton width='82%' height='14px' style={{ marginBottom: '7px' }} />
                  <Skeleton width='100%' height='12px' style={{ marginBottom: '6px' }} />
                  <Skeleton width='94%' height='12px' />
                </div>
              </div>
              <div className='event-details__related-card' aria-hidden='true'>
                <Skeleton variant='rect' width='72px' height='72px' />
                <div className='event-details__related-body'>
                  <Skeleton width='78%' height='14px' style={{ marginBottom: '7px' }} />
                  <Skeleton width='100%' height='12px' style={{ marginBottom: '6px' }} />
                  <Skeleton width='92%' height='12px' />
                </div>
              </div>
              <div className='event-details__related-card' aria-hidden='true'>
                <Skeleton variant='rect' width='72px' height='72px' />
                <div className='event-details__related-body'>
                  <Skeleton width='80%' height='14px' style={{ marginBottom: '7px' }} />
                  <Skeleton width='100%' height='12px' style={{ marginBottom: '6px' }} />
                  <Skeleton width='91%' height='12px' />
                </div>
              </div>
            </>
          ) : null}

          <section className='event-details__year-article'>
            <h3 className='event-details__related-title'>{t.yearArticle}</h3>
            {isPageLoading ? (
              <div className='event-details__year-article-card' aria-hidden='true'>
                <Skeleton width='88%' height='13px' style={{ marginBottom: '8px' }} />
                <Skeleton width='100%' height='12px' style={{ marginBottom: '6px' }} />
                <Skeleton width='95%' height='12px' style={{ marginBottom: '6px' }} />
                <Skeleton width='90%' height='12px' style={{ marginBottom: '8px' }} />
                <Skeleton width='76px' height='11px' />
              </div>
            ) : null}
            {isLoadingYearArticle ? (
              <div className='event-details__year-article-card' aria-hidden='true'>
                <Skeleton width='88%' height='13px' style={{ marginBottom: '8px' }} />
                <Skeleton width='100%' height='12px' style={{ marginBottom: '6px' }} />
                <Skeleton width='95%' height='12px' style={{ marginBottom: '6px' }} />
                <Skeleton width='90%' height='12px' style={{ marginBottom: '8px' }} />
                <Skeleton width='76px' height='11px' />
              </div>
            ) : null}
            {!isPageLoading && !isLoadingYearArticle && !randomYearArticle ? (
              <p className='event-details__related-empty'>{t.noYearArticle}</p>
            ) : null}
            {!isPageLoading && !isLoadingYearArticle && randomYearArticle ? (
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
            {!isPageLoading && (randomYearArticle || isLoadingYearArticle) ? (
              <button
                className='event-details__year-randomize'
                onClick={handleRandomizeYearArticle}
                disabled={isLoadingYearArticle}
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
