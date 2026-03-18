export default function AtlasCoreLogoSVG({
  width = 24,
  height = 24,
  className = '',
  variant = 'light',
  alt = 'Atlas Core',
}) {
  const src = variant === 'dark'
    ? '/branding/dark/apple-touch-icon.png'
    : '/branding/light/apple-touch-icon.png';

  return (
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      style={{ objectFit: 'contain' }}
    />
  );
}
