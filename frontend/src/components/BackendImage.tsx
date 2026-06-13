"use client";

import React, { useState } from "react";
import { getDisplayImageUrl, ImageType } from "@/lib/imageUtils";

interface BackendImageProps {
  src?: string;
  alt: string;
  type?: ImageType;
  className?: string;
}

export default function BackendImage({
  src,
  alt,
  type = "blog",
  className = "",
}: BackendImageProps) {
  const [hasError, setHasError] = useState(false);

  const imageUrl = getDisplayImageUrl(hasError ? undefined : src, type);

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
