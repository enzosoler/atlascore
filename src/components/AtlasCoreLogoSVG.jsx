/**
 * AtlasCoreLogoSVG
 *
 * Inline SVG mark — works at any size, no network request, theme-safe.
 * The shape is an "A" crossbar with a center dot, mirroring the favicon.
 * Color defaults to currentColor so it inherits from the parent text color.
 */
export default function AtlasCoreLogoSVG({
  width = 24,
  height = 24,
  className = '',
  color = 'currentColor',
  alt = 'atlas.core',
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="136 106 428 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt}
      role="img"
      className={className}
    >
      {/* Heartbeat-to-Arrow Icon */}
      <path d="M150 200H250L275 240L325 120L375 240L400 200H450L550 140" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M530 140H550V160" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
