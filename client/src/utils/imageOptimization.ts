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

// This is a utility function that returns props for an optimized image
export function getOptimizedImageProps(props: OptimizedImageProps) {
  const {
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
  } = props;

  const optimizedSrc = generateOptimizedImageSrc(src, { width, height, quality });
  const srcSet = generateSrcSet(src);
  const imageSizes = sizes || generateSizes();
  
  return {
    src: optimizedSrc,
    srcSet,
    sizes: imageSizes,
    alt,
    width,
    height,
    className,
    loading,
    decoding: 'async' as const,
    onLoad,
    onError,
    style: { 
      contentVisibility: 'auto' as any,
      objectFit: 'cover' as const,
      aspectRatio: width && height ? `${width}/${height}` : 'auto',
      maxWidth: '100%',
      height: 'auto'
    }
  };
}

export function preloadImage(src: string, options: ImageOptimizationOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = generateOptimizedImageSrc(src, options);
  });
}

export function lazyLoadImage(img: HTMLImageElement, options: ImageOptimizationOptions = {}): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          target.src = generateOptimizedImageSrc(target.dataset.src || '', options);
          observer.unobserve(target);
        }
      });
    },
    { rootMargin: '50px' }
  );
  
  observer.observe(img);
}