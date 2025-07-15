interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
}

export function generateOptimizedImageSrc(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const { width, height, quality = 85, format = 'webp' } = options;
  
  // For development, return original src
  if (import.meta.env.DEV) {
    return src;
  }
  
  // In production, you would integrate with a CDN service like Cloudinary or ImageKit
  // For now, return the original src with cache-busting for better performance
  const url = new URL(src, window.location.origin);
  
  if (width) url.searchParams.set('w', width.toString());
  if (height) url.searchParams.set('h', height.toString());
  if (quality !== 85) url.searchParams.set('q', quality.toString());
  if (format !== 'webp') url.searchParams.set('f', format);
  
  return url.toString();
}

export function generateSrcSet(
  src: string,
  widths: number[] = [320, 640, 960, 1280, 1600]
): string {
  return widths
    .map(width => `${generateOptimizedImageSrc(src, { width })} ${width}w`)
    .join(', ');
}

export function generateSizes(
  breakpoints: { [key: string]: string } = {
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '50vw',
    default: '33vw'
  }
): string {
  const entries = Object.entries(breakpoints);
  const mediaQueries = entries.slice(0, -1).map(([query, size]) => `${query} ${size}`);
  const defaultSize = entries[entries.length - 1][1];
  
  return [...mediaQueries, defaultSize].join(', ');
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  quality = 85,
  loading = 'lazy',
  sizes,
  onLoad,
  onError
}: OptimizedImageProps) {
  const optimizedSrc = generateOptimizedImageSrc(src, { width, height, quality });
  const srcSet = generateSrcSet(src);
  const imageSizes = sizes || generateSizes();
  
  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={imageSizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      decoding="async"
      onLoad={onLoad}
      onError={onError}
      style={{ contentVisibility: 'auto' }}
    />
  );
}