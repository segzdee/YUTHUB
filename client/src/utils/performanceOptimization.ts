// Performance optimization utilities for SEO and Core Web Vitals

export function preloadCriticalResources() {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href =
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  fontLink.as = 'style';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical images
  const heroImageLink = document.createElement('link');
  heroImageLink.rel = 'preload';
  heroImageLink.href = '/hero-image.jpg';
  heroImageLink.as = 'image';
  document.head.appendChild(heroImageLink);
}

export function optimizeImages() {
  // Enable native lazy loading for images
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
}

export function enableServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

export function measureWebVitals() {
  // Measure Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'LCP', {
          event_category: 'Web Vitals',
          value: Math.round(lastEntry.startTime),
          non_interaction: true,
        });
      }
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const firstEntry = entries[0];

      if (window.gtag) {
        window.gtag('event', 'FID', {
          event_category: 'Web Vitals',
          value: Math.round(firstEntry.processingStart - firstEntry.startTime),
          non_interaction: true,
        });
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      if (window.gtag) {
        window.gtag('event', 'CLS', {
          event_category: 'Web Vitals',
          value: Math.round(clsValue * 1000),
          non_interaction: true,
        });
      }
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}

export function optimizeForMobile() {
  // Optimize viewport for mobile
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
    );
  }

  // Add touch-friendly styles
  const style = document.createElement('style');
  style.textContent = `
    /* Touch-friendly interactions */
    button, a, input, select, textarea {
      touch-action: manipulation;
    }
    
    /* Improve tap targets */
    button, a {
      min-height: 44px;
      min-width: 44px;
    }
    
    /* Optimize for smooth scrolling */
    html {
      scroll-behavior: smooth;
    }
    
    /* Reduce motion for users who prefer it */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function initializePerformanceOptimizations() {
  // Run on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadCriticalResources();
      optimizeImages();
      optimizeForMobile();
      measureWebVitals();
    });
  } else {
    preloadCriticalResources();
    optimizeImages();
    optimizeForMobile();
    measureWebVitals();
  }

  // Enable service worker
  enableServiceWorker();
}

// Global performance monitoring
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
