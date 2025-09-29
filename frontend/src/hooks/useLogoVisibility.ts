"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Custom hook to track the visibility of the large logo in the hero section
 * Returns true when the large logo is visible, false when it's scrolled out of view
 * Only applies to the home page - other pages always show navbar logo
 */
export const useLogoVisibility = () => {
  const [isLargeLogoVisible, setIsLargeLogoVisible] = useState(true);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    // Only track logo visibility on home page
    if (!isHomePage) {
      setIsLargeLogoVisible(false); // Always show navbar logo on non-home pages
      return;
    }

    // Find the large logo element in the hero section
    const largeLogoElement = document.querySelector('[data-large-logo]');
    
    if (!largeLogoElement) {
      // If no large logo found on home page, show navbar logo
      setIsLargeLogoVisible(false);
      return;
    }

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Logo is visible when it intersects with the viewport
          const isVisible = entry.isIntersecting;
          setIsLargeLogoVisible(isVisible);
          
          // Debug logging (remove in production)
          if (process.env.NODE_ENV === 'development') {
            console.log('Large logo visibility changed:', isVisible);
          }
        });
      },
      {
        // Trigger when logo is 30% visible for smoother transition
        threshold: 0.3,
        // Add some margin to prevent flickering
        rootMargin: '0px 0px -5% 0px'
      }
    );

    // Start observing the large logo
    observer.observe(largeLogoElement);

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [isHomePage]);

  // For non-home pages, always return false (show navbar logo)
  // For home page, return the actual visibility state
  return isHomePage ? isLargeLogoVisible : false;
};
