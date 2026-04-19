import { cn } from '@/lib/utils';

/**
 * AtlasCoreLogoSVG — brand mark component.
 *
 * variant="icon"    (default) — square brand app icon.
 *                               Use in headers/nav where text is separate.
 *
 * variant="lockup"            — full lockup asset.
 *                               Use on loading screens, auth pages, and standalone displays.
 *
 * `width` controls the rendered size in both variants.
 * `color` and `height` are accepted for backwards-compatibility but unused.
 */
export default function AtlasCoreLogoSVG({
  width = 32,
  height,   // unused — always square
  variant = 'icon',
  className = '',
  color,    // unused — brand asset is baked in
  alt = 'atlas.core',
}) {
  if (variant === 'lockup') {
    return (
      <img
        src="/branding/v3/svg/lockup-stacked.svg"
        width={width}
        height={width}
        alt={alt}
        draggable={false}
        className={cn('shrink-0 object-contain', className)}
      />
    );
  }

  return (
    <img
      src="/branding/v3/app-icon/paper-192.png"
      width={width}
      height={width}
      alt={alt}
      draggable={false}
      className={cn('rounded-[22%] shrink-0 object-cover', className)}
    />
  );
}
