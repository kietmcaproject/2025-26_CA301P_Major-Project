import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * Lazy loading image component with intersection observer
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for image
 * @param {object} sx - MUI sx prop for styling
 * @param {string} placeholder - Placeholder image URL (optional)
 */
function LazyImage({ src, alt, sx = {}, placeholder, ...props }) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageRef, setImageRef] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    let observer;
    
    if (imageRef && !isInView) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before image enters viewport
        }
      );
      
      observer.observe(imageRef);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [imageRef, isInView]);

  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        // Handle error - could set a fallback image
        setIsLoaded(true);
      };
    }
  }, [isInView, src]);

  return (
    <Box
      ref={setImageRef}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        ...sx
      }}
      {...props}
    >
      {!isLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          loading="lazy"
          decoding="async"
        />
      )}
    </Box>
  );
}

export default LazyImage;

