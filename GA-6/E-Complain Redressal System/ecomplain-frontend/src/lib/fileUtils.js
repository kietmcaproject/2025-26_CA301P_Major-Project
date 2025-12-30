/**
 * Utility functions for handling file operations (PDFs, images, etc.)
 */

/**
 * Get proxied PDF URL for Cloudinary PDFs
 * @param {string} pdfUrl - The original PDF URL (Cloudinary or other)
 * @returns {string} - The proxied URL if from Cloudinary, otherwise the original URL
 */
export const getPdfProxyUrl = (pdfUrl) => {
  if (!pdfUrl) {
    console.warn('[getPdfProxyUrl] No PDF URL provided');
    return '';
  }
  
  // Check if it's already a full Cloudinary URL
  if (pdfUrl.includes('cloudinary.com')) {
    const proxyUrl = `/api/complaints/attachments/pdf?url=${encodeURIComponent(pdfUrl)}`;
    console.log('[getPdfProxyUrl] Cloudinary URL detected:', { original: pdfUrl, proxy: proxyUrl });
    return proxyUrl;
  }
  
  // Check if it's a relative URL or just a filename
  if (pdfUrl.startsWith('/') || !pdfUrl.startsWith('http')) {
    console.error('[getPdfProxyUrl] Invalid PDF URL format (relative or filename):', pdfUrl);
    console.error('[getPdfProxyUrl] Expected full Cloudinary URL like: https://res.cloudinary.com/.../raw/upload/...pdf');
    // Don't return relative URLs as they will cause React Router navigation
    return '';
  }
  
  // If it's a full URL but not Cloudinary, return as-is (might be external)
  console.log('[getPdfProxyUrl] Non-Cloudinary URL, returning as-is:', pdfUrl);
  return pdfUrl;
};

/**
 * Get proxied image URL for Cloudinary images
 * @param {string} imageUrl - The original image URL (Cloudinary or other)
 * @returns {string} - The proxied URL if from Cloudinary, otherwise the original URL
 */
export const getImageProxyUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.includes('cloudinary.com')) {
    return `/api/complaints/attachments/image?url=${encodeURIComponent(imageUrl)}`;
  }
  return imageUrl;
};

/**
 * Handle viewing PDF in a new tab/window
 * Uses proxy URL for Cloudinary PDFs to avoid CORS issues
 * @param {string} pdfUrl - The PDF URL to view
 * @param {Function} onError - Optional error callback
 */
export const handleViewPdf = (pdfUrl, onError) => {
  if (!pdfUrl) {
    if (onError) {
      onError("No PDF available.");
    } else {
      alert("No PDF available.");
    }
    return;
  }

  try {
    // Use proxy URL for Cloudinary PDFs
    const proxyUrl = getPdfProxyUrl(pdfUrl);
    window.open(proxyUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error('Error opening PDF:', error);
    if (onError) {
      onError("Failed to open PDF. Please try again.");
    } else {
      alert("Failed to open PDF. Please try again.");
    }
  }
};

/**
 * Handle viewing image in a new tab/window
 * Uses proxy URL for Cloudinary images to avoid CORS issues
 * @param {string} imageUrl - The image URL to view
 * @param {Function} onError - Optional error callback
 */
export const handleViewImage = (imageUrl, onError) => {
  if (!imageUrl) {
    if (onError) {
      onError("No image available.");
    } else {
      alert("No image available.");
    }
    return;
  }

  try {
    // Use proxy URL for Cloudinary images
    const proxyUrl = getImageProxyUrl(imageUrl);
    window.open(proxyUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error('Error opening image:', error);
    if (onError) {
      onError("Failed to open image. Please try again.");
    } else {
      alert("Failed to open image. Please try again.");
    }
  }
};

/**
 * Download a file (PDF, image, etc.)
 * @param {string} fileUrl - The file URL to download
 * @param {string} fileName - The name to save the file as
 * @param {Function} onError - Optional error callback
 */
export const handleDownloadFile = async (fileUrl, fileName, onError) => {
  if (!fileUrl) {
    if (onError) {
      onError("No file available for download.");
    } else {
      alert("No file available for download.");
    }
    return;
  }

  try {
    // For Cloudinary files, use proxy for download
    const proxyUrl = fileUrl.includes('cloudinary.com') 
      ? getPdfProxyUrl(fileUrl) 
      : fileUrl;

    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = fileName || 'download';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
    if (onError) {
      onError("Failed to download file. Please try again.");
    } else {
      alert("Failed to download file. Please try again.");
    }
  }
};

/**
 * Check if a file is a PDF based on URL or MIME type
 * @param {string} url - The file URL
 * @param {string} mimeType - Optional MIME type
 * @returns {boolean}
 */
export const isPdfFile = (url, mimeType) => {
  if (mimeType === 'application/pdf') return true;
  if (url && /\.pdf$/i.test(url)) return true;
  return false;
};

/**
 * Check if a file is an image based on URL or MIME type
 * @param {string} url - The file URL
 * @param {string} mimeType - Optional MIME type
 * @returns {boolean}
 */
export const isImageFile = (url, mimeType) => {
  if (mimeType && mimeType.startsWith('image/')) return true;
  if (url && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)) return true;
  return false;
};

