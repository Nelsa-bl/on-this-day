import { useNavigate } from 'react-router-dom';
import noImage from '../../assets/no_image.jpg';
import { translations } from '../../utils/translations/translations';
import {
  categorizeEvent,
  getCategoryClassification,
  getPrimaryPage,
} from '../../utils/events/eventMeta';
import { getCategoryIcon } from '../../utils/events/categoryBadge';
import Skeleton from '../skeleton/skeleton.component';
import './card.style.scss';

const Card = ({ data, eventType, itemIndex, language, loading = false }) => {
  const navigate = useNavigate();
  const page = getPrimaryPage(data) || data?.pages?.[0];
  const t = translations[language] || translations.bs;
  const eventYear = Number(data?.year);
  const currentYear = new Date().getFullYear();
  const yearsAgo =
    Number.isFinite(eventYear) && eventYear > 0 && eventYear <= currentYear
      ? currentYear - eventYear
      : null;
  const category = categorizeEvent(data);
  const categoryMeta = getCategoryClassification(data);
  const categoryDebugTitle =
    process.env.NODE_ENV !== 'production'
      ? `${categoryMeta.category} | ${categoryMeta.source} | ${categoryMeta.confidence}`
      : undefined;
  const categoryIcon = getCategoryIcon(category);

  const handleOpen = () => {
    if (loading) return;
    if (!page?.pageid) return;
    sessionStorage.setItem('lastClickedPageId', String(page.pageid));
    sessionStorage.setItem('lastClickedType', String(eventType));
    sessionStorage.setItem('lastClickedIndex', String(itemIndex));
    sessionStorage.setItem('lastClickedScrollY', String(window.scrollY || 0));
    navigate(`/event/${eventType}/${page.pageid}`, {
      state: { event: data, eventType, wikiPage: page },
    });
  };

  return (
    <div
      className='card-container'
      data-pageid={page?.pageid}
      onClick={handleOpen}
      onKeyDown={(e) => (e.key === 'Enter' ? handleOpen() : null)}
      role='button'
      tabIndex={0}
    >
      <div className='card-year-row'>
        <h4>
          {loading ? <Skeleton width='58px' height='20px' /> : data?.year}
        </h4>
        {!loading && yearsAgo != null ? (
          <span className='years-ago-badge'>
            {yearsAgo} {t.yearsAgo}
          </span>
        ) : null}
        {loading ? <Skeleton width='72px' height='14px' /> : null}
      </div>
      <span className='name'>
        {loading ? (
          <Skeleton width='70%' height='16px' />
        ) : (
          page?.titles?.normalized
        )}
      </span>

      <div
        className='card-image-bg'
        style={{
          backgroundImage: loading
            ? 'none'
            : `url(${page?.thumbnail?.source || noImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ...(loading || page?.thumbnail?.source
            ? {}
            : { opacity: 0.3, border: '1px solid gray' }),
        }}
      >
        {loading ? (
          <Skeleton variant='rect' width='100%' height='100%' />
        ) : (
          <span
            className={`card-category-badge card-image-category-badge card-category-badge--${category}`}
            title={categoryDebugTitle}
            data-category-source={categoryMeta.source}
            data-category-confidence={String(categoryMeta.confidence)}
          >
            <svg
              className='card-category-badge__icon'
              viewBox={categoryIcon.viewBox}
              aria-hidden='true'
            >
              {categoryIcon.paths.map((path) => (
                <path key={path} d={path} />
              ))}
            </svg>
            {t[category] || category}
          </span>
        )}
      </div>
      <span className='desc'>
        {loading ? <Skeleton width='45%' height='13px' /> : page?.description}
      </span>

      <br />
      <b className='ellipsisShort'>
        {loading ? (
          <>
            <Skeleton
              width='100%'
              height='14px'
              style={{ marginBottom: '5px' }}
            />
            <Skeleton
              width='95%'
              height='14px'
              style={{ marginBottom: '5px' }}
            />
            <Skeleton width='90%' height='14px' />
          </>
        ) : (
          data?.text
        )}
      </b>
      <br />
      <small className='ellipsisLong'>
        {loading ? (
          <>
            <Skeleton
              width='100%'
              height='12px'
              style={{ marginBottom: '4px' }}
            />
            <Skeleton
              width='97%'
              height='12px'
              style={{ marginBottom: '4px' }}
            />
            <Skeleton
              width='95%'
              height='12px'
              style={{ marginBottom: '4px' }}
            />
            <Skeleton width='92%' height='12px' />
          </>
        ) : (
          page?.extract
        )}
      </small>
    </div>
  );
};

export default Card;
