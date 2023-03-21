// Import style
import './button.style.scss';

const Button = ({
  children,
  eventType,
  activeType,
  onClick,
  ...otherProps
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(eventType);
    }
  };

  const isActive = eventType && eventType === activeType;
  const className = `btn-small ${isActive ? 'btn-active' : ''}`;

  return (
    <button className={className} onClick={handleClick} {...otherProps}>
      {children}
    </button>
  );
};

export default Button;
