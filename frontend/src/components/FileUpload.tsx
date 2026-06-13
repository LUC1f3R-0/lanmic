"use client";

import React, { useRef, useState } from "react";
import { blogApi } from "@/lib/blogApi";
import { getDisplayImageUrl, ImageType } from "@/lib/imageUtils";

interface FileUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  uploadPath?: string;
  placeholder?: string;
  className?: string;
  fieldName?: string;
}

function getImageTypeFromFieldName(fieldName?: string): ImageType {
  switch (fieldName) {
    case "authorImage":
      return "author";
    case "blogImage":
      return "blog";
    case "teamImage":
    case "team-images":
      return "team-images";
    case "executiveImage":
      return "executive";
    case "testimonialImage":
    case "testimonial-images":
      return "testimonial-images";
    default:
      return "blog";
  }
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  currentImage,
  uploadPath = "blog-images",
  placeholder = "Upload image",
  className = "",
  fieldName,
}) => {
  const actualFieldName = fieldName || uploadPath;
  const imageType = getImageTypeFromFieldName(actualFieldName);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
      setError("Please select a valid image file (JPG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrl = await blogApi.uploadImage(file, actualFieldName);

      // Keep the backend returned path exactly:
      // /uploads/author-images/file.png
      // /uploads/blog-images/file.png
      onUpload(uploadedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const previewUrl = currentImage
    ? getDisplayImageUrl(currentImage, imageType)
    : "";

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
        >
          {isUploading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {placeholder}
            </>
          )}
        </button>

        {currentImage && (
          <span className="text-sm text-green-600">Image selected</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </p>
      )}

      {previewUrl && (
        <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};
