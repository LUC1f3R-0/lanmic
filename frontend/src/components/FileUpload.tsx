"use client";

import React, { useState, useRef } from 'react';
import { blogApi } from '@/lib/blogApi';
import { getDisplayImageUrl } from '@/lib/imageUtils';

interface FileUploadProps {
  onUpload: (filename: string) => void;
  currentImage?: string; // Now expects filename, not full URL
  uploadPath?: string; // Path for upload (e.g., 'team-images', 'blog-images')
  placeholder?: string;
  className?: string;
  fieldName?: string; // Add field name to determine upload destination
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  currentImage,
  uploadPath = "blog-images",
  placeholder = "Upload image",
  className = "",
  fieldName
}) => {
  // Use uploadPath as fieldName if fieldName is not provided
  const actualFieldName = fieldName || uploadPath;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
      setError('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const url = await blogApi.uploadImage(file, actualFieldName);
      // Extract only the filename from the URL
      let filename = url;
      if (url.includes('/')) {
        filename = url.split('/').pop() || url;
      }
      onUpload(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

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
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {placeholder}
            </>
          )}
        </button>
        
        {currentImage && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Current:</span>
            <a
              href={getDisplayImageUrl(currentImage, uploadPath as 'blog' | 'author' | 'team-images')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View Image
            </a>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {currentImage && (
        <div className="mt-2">
          <img
            src={getDisplayImageUrl(currentImage, uploadPath as 'blog' | 'author' | 'team-images')}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};
