import './skeleton.style.scss';

const Skeleton = ({
  width,
  height,
  radius,
  variant = 'line',
  className = '',
  style,
}) => {
  return (
    <span
      className={`skeleton skeleton--${variant} ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden='true'
    />
  );
};

export default Skeleton;
