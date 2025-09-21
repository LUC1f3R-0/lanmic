/**
 * Utility functions for handling image URLs
 */

/**
 * Converts a relative image URL to a full URL
 * @param url - The image URL (can be relative or absolute)
 * @returns The full URL for the image
 */
export const getFullImageUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's a relative URL, prepend the API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  return `${apiBaseUrl}${url}`;
};

/**
 * Gets the appropriate image URL for display
 * @param url - The image URL from the database
 * @param type - The type of image (blog, author, etc.) for appropriate fallback
 * @returns The full URL for display, or a fallback image if url is empty
 */
export const getDisplayImageUrl = (url: string, type: 'blog' | 'author' = 'blog'): string => {
  const fullUrl = getFullImageUrl(url);
  
  // If the URL is empty or invalid, return a fallback image
  if (!fullUrl) {
    if (type === 'author') {
      return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format&q=80';
    }
    return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop&auto=format&q=80';
  }
  
  return fullUrl;
};
