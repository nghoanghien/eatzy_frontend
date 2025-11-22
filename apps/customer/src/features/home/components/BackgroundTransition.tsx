'use client';

import { motion, AnimatePresence } from '@repo/ui/motion';
import { useEffect, useRef, useState } from 'react';

interface BackgroundTransitionProps {
  imageUrl: string;
  categoryName: string;
  slideUp?: boolean;
}

export default function BackgroundTransition({
  imageUrl,
  slideUp = false,
}: BackgroundTransitionProps) {
  const [loaded, setLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [prevImage, setPrevImage] = useState<string | null>(null);
  const [showPrev, setShowPrev] = useState(false);
  const hidePrevTimeout = useRef<number | null>(null);
  const prevImageRef = useRef<string | null>(null);
  const fadeMs = 320;

  useEffect(() => {
    prevImageRef.current = currentImage;
  }, [currentImage]);

  useEffect(() => {
    if (hidePrevTimeout.current) {
      clearTimeout(hidePrevTimeout.current);
      hidePrevTimeout.current = null;
    }
    const prev = prevImageRef.current;
    setPrevImage(prev);
    setShowPrev(!!prev);
    setLoaded(false);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setCurrentImage(imageUrl);
      setLoaded(true);
      hidePrevTimeout.current = window.setTimeout(() => {
        setShowPrev(false);
      }, fadeMs);
    };
    img.onerror = () => {
      setCurrentImage(imageUrl);
      setLoaded(true);
      hidePrevTimeout.current = window.setTimeout(() => {
        setShowPrev(false);
      }, fadeMs);
    };
    return () => {
      if (hidePrevTimeout.current) {
        clearTimeout(hidePrevTimeout.current);
        hidePrevTimeout.current = null;
      }
    };
  }, [imageUrl]);

  return (
    <motion.div className="fixed inset-0 -z-10" animate={{ y: slideUp ? '-100vh' : 0 }} transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}>
      <motion.div
        key={currentImage}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: fadeMs / 1000, ease: [0.33, 1, 0.68, 1] }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <AnimatePresence initial={false}>
        {showPrev && prevImage && prevImage !== currentImage ? (
          <motion.div
            key={`prev-${prevImage}`}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: loaded ? 0 : 1, scale: loaded ? 1.1 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeMs / 1000, ease: [0.33, 1, 0.68, 1] }}
            className="absolute inset-0 z-10"
            style={{
              backgroundImage: `url(${prevImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : null}
      </AnimatePresence>
      
      <div className="absolute inset-0 z-20 pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      <div 
        className="absolute inset-0 z-20 pointer-events-none" 
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.5) 100%)'
        }} 
      />

      <div className="absolute inset-0 bg-[#1a1a1a] -z-10" />
    </motion.div>
  );
}
