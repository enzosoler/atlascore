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
      <div className={cn('flex flex-col items-center gap-2 shrink-0', className)}>
        <img
          src="/branding/dark/icon-512.png"
          width={width}
          height={width}
          alt={alt}
          draggable={false}
          className="rounded-[22%] shrink-0 object-cover"
        />
        <span
          style={{ fontSize: Math.round(width * 0.2) }}
          className="font-bold tracking-[-0.03em] text-[hsl(var(--fg))] select-none"
        >
          atlas.core
        </span>
      </div>
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
