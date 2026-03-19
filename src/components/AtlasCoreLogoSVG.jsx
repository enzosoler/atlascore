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
  alt = 'Atlas Core',
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt}
      role="img"
      className={className}
    >
      {/* Left leg of A */}
      <line
        x1="50" y1="10"
        x2="10" y2="90"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Right leg of A */}
      <line
        x1="50" y1="10"
        x2="90" y2="90"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Crossbar */}
      <line
        x1="26" y1="63"
        x2="74" y2="63"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Center dot on crossbar */}
      <circle cx="50" cy="63" r="7.5" fill={color} />
    </svg>
  );
}
