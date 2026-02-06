// Import style
import './spinner.style.scss';

const Spinner = ({ variant = 'page' }) => {
  return (
    <div
      className={variant === 'inline' ? 'spinner-inline' : 'spinner-overlay'}
    >
      <div className='spinner-container'></div>
    </div>
  );
};

export default Spinner;
