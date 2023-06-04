// Import style
import './card.style.scss';

const Card = ({ data }) => {
  return (
    <div className='card-container'>
      <a href={data.pages[1]?.content_urls?.mobile?.page}>
        <h4>{data.year}</h4>
        <span className='name'>{data.pages[1]?.titles?.normalized}</span>
        {data.pages[1]?.thumbnail?.source && (
          <img
            className='image'
            alt={data.pages[1]?.normalizedtitle}
            src={data.pages[1]?.thumbnail?.source}
          />
        )}

        <span className='desc'>{data.pages[1]?.description}</span>
        <p>{data.text}</p>
      </a>
    </div>
  );
};

export default Card;
