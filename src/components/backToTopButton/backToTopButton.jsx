import { useEffect, useState } from 'react';
import './backToTopButton.style.scss';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const forceTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // Keep smooth UX; only force exact top at the end if mobile interrupted.
    window.setTimeout(() => {
      if (window.scrollY > 1) forceTop();
    }, 900);
  };

  return (
    isVisible && (
      <button
        className='back-to-top'
        onClick={scrollToTop}
        aria-label='Back to top'
      >
        ↑ Top
      </button>
    )
  );
};

export default BackToTopButton;
