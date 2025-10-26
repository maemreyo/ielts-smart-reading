import { useCallback, useEffect } from "react";

interface UseAutoScrollProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentParagraph: number;
  setCurrentParagraph: React.Dispatch<React.SetStateAction<number>>;
  readingSpeed: number;
  totalParagraphs: number;
  autoScrollRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function useAutoScroll({
  isPlaying,
  setIsPlaying,
  currentParagraph,
  setCurrentParagraph,
  readingSpeed,
  totalParagraphs,
  autoScrollRef,
}: UseAutoScrollProps) {
  
  const startAutoScroll = useCallback(() => {
    if (currentParagraph >= totalParagraphs - 1) {
      setCurrentParagraph(0);
    }
    setIsPlaying(true);
  }, [currentParagraph, totalParagraphs, setCurrentParagraph, setIsPlaying]);

  const stopAutoScroll = useCallback(() => {
    setIsPlaying(false);
    if (autoScrollRef.current) {
      clearTimeout(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, [setIsPlaying, autoScrollRef]);

  const nextParagraph = useCallback(() => {
    setCurrentParagraph((prev: number) => Math.min(prev + 1, totalParagraphs - 1));
  }, [setCurrentParagraph, totalParagraphs]);

  const prevParagraph = useCallback(() => {
    setCurrentParagraph((prev: number) => Math.max(prev - 1, 0));
  }, [setCurrentParagraph]);

  // Auto-scroll logic
  useEffect(() => {
    if (isPlaying && currentParagraph < totalParagraphs - 1) {
      const wordsPerParagraph = 50; // Average estimate
      const timePerParagraph = (wordsPerParagraph / readingSpeed) * 60 * 1000;
      
      autoScrollRef.current = setTimeout(() => {
        setCurrentParagraph((prev: number) => {
          const next = prev + 1;
          if (next >= totalParagraphs) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, timePerParagraph);
    } else if (currentParagraph >= totalParagraphs - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current);
      }
    };
  }, [isPlaying, currentParagraph, readingSpeed, totalParagraphs, setCurrentParagraph, setIsPlaying, autoScrollRef]);

  return {
    startAutoScroll,
    stopAutoScroll,
    nextParagraph,
    prevParagraph,
  };
}