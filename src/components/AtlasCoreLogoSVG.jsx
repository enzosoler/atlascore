import { cn } from '@/lib/utils';

/**
 * AtlasCoreLogoSVG — brand mark component.
 *
 * variant="icon"    (default) — square gradient wave PNG mark only.
 *                               Use in headers/nav where text is separate.
 *
 * variant="lockup"            — full logo: 3D wave mark + "atlas.core" text
 *                               below. Square aspect ratio. Use on loading
 *                               screens, auth pages, and standalone displays.
 *
 * `width` controls the rendered size in both variants.
 * `color` and `height` are accepted for backwards-compatibility but unused.
 */
export default function AtlasCoreLogoSVG({
  width = 32,
  height,   // unused — always square
  variant = 'icon',
  className = '',
  color,    // unused — gradient is baked in
  alt = 'atlas.core',
}) {
  if (variant === 'lockup') {
    return (
      <img
        src="/branding/logo-lockup.svg"
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
      src="/branding/dark/icon-192.png"
      width={width}
      height={width}
      alt={alt}
      draggable={false}
      className={cn('rounded-[22%] shrink-0 object-cover', className)}
    />
  );
}
