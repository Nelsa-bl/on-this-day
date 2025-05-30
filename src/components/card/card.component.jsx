import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '../../utils/hooks/useIsMobile';
import noImage from '../../assets/no_image.jpg';
import './card.style.scss';

const Card = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);
  const isMobile = useIsMobile();

  const page = data.pages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 300); // Match CSS animation duration
  };

  return (
    <>
      <div className='card-container' onClick={() => setIsModalOpen(true)}>
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

      {isModalOpen && (
        <div className='modal-backdrop'>
          <div
            className={`${isMobile ? 'bottom-sheet' : 'modal-content'} ${
              isClosing ? 'closing' : ''
            }`}
            ref={modalRef}
          >
            <button className='close-btn' onClick={closeModal}>
              ✕
            </button>
            <div className='bottom-sheet-body'>
              <h2 className='headline-modal'>{page?.titles?.normalized}</h2>
              <h4 className='small-headline'>{data.year}</h4>
              {page?.thumbnail?.source ? (
                <img
                  className='modal-image'
                  alt={page?.normalizedtitle}
                  src={page?.thumbnail?.source}
                />
              ) : (
                <img
                  className='modal-image-non'
                  alt='Not available'
                  src={noImage}
                />
              )}
              <span className='desc'>{page?.description}</span>
              <p>
                <b>{data.text}</b>
              </p>
              <p>{page?.extract}</p>
            </div>

            <div className='footer'>
              <button className='close-bottom-btn' onClick={closeModal}>
                Close Article
              </button>
              <button
                className='read-more-btn'
                onClick={() =>
                  window.open(page?.content_urls?.mobile?.page, '_blank')
                }
              >
                Read Full Article
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
