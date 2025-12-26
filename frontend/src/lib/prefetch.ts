/**
 * Prefetch utility for navigation optimization
 * Prefetches pages on hover to reduce actual load times
 */

// Cache to track prefetched URLs and avoid duplicate prefetches
const prefetchCache = new Set<string>();
const MAX_CACHE_SIZE = 50;

/**
 * Clean up old cache entries if cache exceeds max size
 */
function cleanupCache() {
  if (prefetchCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(prefetchCache);
    // Remove oldest entries (first half)
    entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2)).forEach(url => {
      prefetchCache.delete(url);
    });
  }
}

/**
 * Check if URL is internal to the site
 */
function isInternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Check if URL should be prefetched (exclude anchors, downloads, etc.)
 */
function shouldPrefetch(url: string): boolean {
  // Skip anchor links
  if (url.startsWith('#')) return false;
  
  // Skip mailto, tel, javascript protocols
  if (/^(mailto|tel|javascript):/i.test(url)) return false;
  
  // Skip if already prefetched
  if (prefetchCache.has(url)) return false;
  
  // Must be internal URL
  if (!isInternalUrl(url)) return false;
  
  return true;
}

/**
 * Create a prefetch link element
 */
function createPrefetchLink(url: string): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';
  return link;
}

/**
 * Prefetch a URL
 * @param url - The URL to prefetch
 * @returns Promise that resolves when prefetch is complete
 */
export function prefetchUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!shouldPrefetch(url)) {
      resolve();
      return;
    }

    try {
      const link = createPrefetchLink(url);
      
      link.onload = () => {
        prefetchCache.add(url);
        cleanupCache();
        resolve();
      };
      
      link.onerror = () => {
        // Don't cache failed prefetches
        resolve();
      };
      
      document.head.appendChild(link);
      
      // Clean up link element after a short delay
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }, 5000);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Prefetch on hover with debouncing
 * @param url - The URL to prefetch
 * @param delay - Delay in milliseconds before prefetching (default: 150ms)
 * @returns Cancel function that can be called to cancel the prefetch
 */
export function prefetchOnHover(url: string, delay: number = 150): () => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const startPrefetch = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      prefetchUrl(url).catch(console.warn);
    }, delay);
  };
  
  const cancelPrefetch = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  // Start prefetch immediately
  startPrefetch();
  
  // Return cancel function for cleanup
  return cancelPrefetch;
}

/**
 * Prefetch multiple URLs (for smart prefetching)
 * @param urls - Array of URLs to prefetch
 * @param maxConcurrent - Maximum concurrent prefetches (default: 3)
 */
export async function prefetchMultiple(urls: string[], maxConcurrent: number = 3): Promise<void> {
  const validUrls = urls.filter(shouldPrefetch);
  
  // Process in batches
  for (let i = 0; i < validUrls.length; i += maxConcurrent) {
    const batch = validUrls.slice(i, i + maxConcurrent);
    await Promise.allSettled(
      batch.map(url => prefetchUrl(url))
    );
  }
}

/**
 * Get current page URL for smart prefetching
 */
export function getCurrentPageUrl(): string {
  return window.location.pathname;
}

/**
 * Get base path from data attribute
 */
export function getBasePath(): string {
  const html = document.documentElement;
  return html.getAttribute('data-base-path') || '';
}
