import { cn } from '@/lib/utils';

/**
 * AtlasCoreLogoSVG — icon mark using the new gradient wave PNG branding asset.
 *
 * The icon is always square. `width` controls the size.
 * `height` and `color` props are accepted for backwards-compatibility
 * but are not used — the gradient is baked into the PNG.
 */
export default function AtlasCoreLogoSVG({
  width = 32,
  height, // unused — icon is always square
  className = '',
  color, // unused — gradient is baked in
  alt = 'atlas.core',
}) {
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
