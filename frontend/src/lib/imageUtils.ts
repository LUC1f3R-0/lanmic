export type ImageType =
  | "blog"
  | "author"
  | "team-images"
  | "executive"
  | "testimonial-images";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export const getFullImageUrl = (url: string): string => {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${API_BASE_URL}${url}`;
  }

  if (url.startsWith("uploads/")) {
    return `${API_BASE_URL}/${url}`;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
};

function getFallbackImage(type: ImageType): string {
  if (type === "author") {
    return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80";
  }

  if (type === "team-images") {
    return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face&auto=format&q=80";
  }

  if (type === "executive") {
    return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face&auto=format&q=80";
  }

  if (type === "testimonial-images") {
    return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face&auto=format&q=80";
  }

  return "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop&auto=format&q=80";
}

function getUploadFolder(type: ImageType): string {
  switch (type) {
    case "author":
      return "author-images";
    case "team-images":
      return "team-images";
    case "executive":
      return "executive-images";
    case "testimonial-images":
      return "testimonial-images";
    case "blog":
    default:
      return "blog-images";
  }
}

export const getDisplayImageUrl = (
  imagePath: string | undefined,
  type: ImageType = "blog",
): string => {
  if (!imagePath) {
    return getFallbackImage(type);
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (imagePath.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imagePath}`;
  }

  if (imagePath.startsWith("uploads/")) {
    return `${API_BASE_URL}/${imagePath}`;
  }

  const folder = getUploadFolder(type);

  return `${API_BASE_URL}/uploads/${folder}/${imagePath}`;
};
