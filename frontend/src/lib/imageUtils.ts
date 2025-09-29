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
 * @param filename - The image filename from the database (e.g., "110c1886-6592-454b-a0e5-5a4827df2450.jpeg")
 * @param type - The type of image (blog, author, team-images, executive, etc.) for appropriate fallback
 * @returns The full URL for display, or a fallback image if filename is empty
 */
export const getDisplayImageUrl = (filename: string | undefined, type: 'blog' | 'author' | 'team-images' | 'executive' = 'blog'): string => {
  if (!filename) {
    // Return fallback image if no filename provided
    if (type === 'author') {
      return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format&q=80';
    }
    if (type === 'team-images') {
      return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face&auto=format&q=80';
    }
    if (type === 'executive') {
      return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face&auto=format&q=80';
    }
    return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop&auto=format&q=80';
  }
  
  // If it's already a full URL, return as is
  if (filename.startsWith('http')) {
    return filename;
  }
  
  // Construct the full URL based on the type
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  
  if (type === 'team-images') {
    return `${apiBaseUrl}/uploads/team-images/${filename}`;
  }
  if (type === 'author') {
    return `${apiBaseUrl}/uploads/author-images/${filename}`;
  }
  if (type === 'executive') {
    return `${apiBaseUrl}/uploads/executive-images/${filename}`;
  }
  // Default to blog images
  return `${apiBaseUrl}/uploads/blog-images/${filename}`;
};
