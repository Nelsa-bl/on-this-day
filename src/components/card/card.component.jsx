import { useNavigate } from 'react-router-dom';
import noImage from '../../assets/no_image.jpg';
import { translations } from '../../utils/translations/translations';
import { categorizeEvent } from '../../utils/events/eventMeta';
import { getCategoryIcon } from '../../utils/events/categoryBadge';
import './card.style.scss';

const Card = ({ data, eventType, itemIndex, language }) => {
  const navigate = useNavigate();
  const page = data.pages[0];
  const t = translations[language] || translations.bs;
  const eventYear = Number(data?.year);
  const currentYear = new Date().getFullYear();
  const yearsAgo =
    Number.isFinite(eventYear) && eventYear > 0 && eventYear <= currentYear
      ? currentYear - eventYear
      : null;
  const category = categorizeEvent(data);
  const categoryIcon = getCategoryIcon(category);

  const handleOpen = () => {
    if (!page?.pageid) return;
    sessionStorage.setItem('lastClickedPageId', String(page.pageid));
    sessionStorage.setItem('lastClickedType', String(eventType));
    sessionStorage.setItem('lastClickedIndex', String(itemIndex));
    sessionStorage.setItem('lastClickedScrollY', String(window.scrollY || 0));
    navigate(`/event/${eventType}/${page.pageid}`, {
      state: { event: data, eventType },
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
        <h4>{data.year}</h4>
        {yearsAgo != null ? (
          <span className='years-ago-badge'>
            {yearsAgo} {t.yearsAgo}
          </span>
        ) : null}
      </div>
      <span className='name'>{page?.titles?.normalized}</span>

      <div
        className='card-image-bg'
        style={{
          backgroundImage: `url(${page?.thumbnail?.source || noImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ...(page?.thumbnail?.source
            ? {}
            : { opacity: 0.3, border: '1px solid gray' }),
        }}
      >
        <span
          className={`card-category-badge card-image-category-badge card-category-badge--${category}`}
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
      </div>
      <span className='desc'>{page?.description}</span>

      <br />
      <b className='ellipsisShort'>{data.text}</b>
      <br />
      <small className='ellipsisLong'>{page?.extract}</small>
    </div>
  );
};

export default Card;
