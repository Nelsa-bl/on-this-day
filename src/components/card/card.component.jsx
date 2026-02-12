import { useNavigate } from 'react-router-dom';
import noImage from '../../assets/no_image.jpg';
import './card.style.scss';

const Card = ({ data, eventType, itemIndex }) => {
  const navigate = useNavigate();
  const page = data.pages[0];

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
      <h4>{data.year}</h4>
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
      />
      <span className='desc'>{page?.description}</span>

      <br />
      <b className='ellipsisShort'>{data.text}</b>
      <br />
      <small className='ellipsisLong'>{page?.extract}</small>
    </div>
  );
};

export default Card;
