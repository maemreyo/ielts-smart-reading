import { useEffect } from "react";

interface UseToolbarAutoHideProps {
  toolbarVisible: boolean;
  setToolbarVisible: (visible: boolean) => void;
  lastScrollY: number;
  setLastScrollY: (scrollY: number) => void;
}

export function useToolbarAutoHide({
  toolbarVisible,
  setToolbarVisible,
  lastScrollY,
  setLastScrollY,
}: UseToolbarAutoHideProps) {
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setToolbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setToolbarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, setToolbarVisible, setLastScrollY]);
}