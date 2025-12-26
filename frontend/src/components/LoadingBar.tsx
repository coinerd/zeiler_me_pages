import { useEffect, useRef, useState } from "react";

/**
 * LoadingBar - Global navigation loading indicator
 * Shows a progress bar at the top of the page when navigation starts
 * Provides immediate visual feedback to users
 */
const LoadingBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate progress animation
  const animateProgress = () => {
    // Start at 10%
    progressRef.current = 10;
    setProgress(10);

    // Animate to 70% over time (simulating network activity)
    const animate = () => {
      if (progressRef.current < 70) {
        progressRef.current += Math.random() * 5;
        setProgress(progressRef.current);
        animationFrameRef.current = requestAnimationFrame(() => {
          timeoutRef.current = setTimeout(animate, 100 + Math.random() * 200);
        });
      }
    };

    timeoutRef.current = setTimeout(animate, 100);
  };

  // Show loading bar
  const show = () => {
    setIsVisible(true);
    setProgress(0);
    animateProgress();
  };

  // Hide loading bar
  const hide = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Animate to 100% before hiding
    setProgress(100);
    setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 200);
  };

  useEffect(() => {
    // Listen for navigation clicks on all anchor tags
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      // Check if it's an internal link
      if (link && link.href) {
        const isInternal = link.hostname === window.location.hostname;
        const isNotAnchor = !link.getAttribute('href')?.startsWith('#');
        const isNotDownload = !link.hasAttribute('download');
        const isNotNewTab = link.target !== '_blank';

        if (isInternal && isNotAnchor && isNotDownload && isNotNewTab) {
          show();
        }
      }
    };

    // Listen for page load completion
    const handleLoad = () => {
      hide();
    };

    // Listen for page hide (user navigated away)
    const handleHide = () => {
      // If page is hidden, we're navigating away
      // The loading bar will be reset on the new page
    };

    // Add event listeners
    document.addEventListener('click', handleClick, true);
    window.addEventListener('load', handleLoad);
    window.addEventListener('pagehide', handleHide);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('pagehide', handleHide);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="loading-bar-container">
      <div
        className="loading-bar"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Laden"
      />
    </div>
  );
};

export default LoadingBar;
