"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhoneticMagnifierProps {
  text: string;
  className?: string;
}

export function PhoneticMagnifier({ text, className = "" }: PhoneticMagnifierProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [magnifiedWord, setMagnifiedWord] = useState('');
  const [focusWordIndex, setFocusWordIndex] = useState(-1);
  const [textBounds, setTextBounds] = useState<DOMRect | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // Split text into words (accounting for IPA symbols)
  const words = text.split(/(\s+|\/|\[|\]|\(|\)|\.)/g).filter(w => w.trim());

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!textRef.current) return;

    const rect = textRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setMousePosition({ x: e.clientX, y: e.clientY });

    // Calculate which word is being hovered
    const wordPosition = x / rect.width;
    const wordIndex = Math.floor(wordPosition * words.length);
    const safeWordIndex = Math.max(0, Math.min(wordIndex, words.length - 1));
    
    setFocusWordIndex(safeWordIndex);
    setMagnifiedWord(words[safeWordIndex] || '');
  }, [words]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (textRef.current) {
      setTextBounds(textRef.current.getBoundingClientRect());
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMagnifiedWord('');
    setFocusWordIndex(-1);
    setTextBounds(null);
  };

  return (
    <>
      <span
        ref={textRef}
        className={`${className} cursor-crosshair relative select-none transition-all duration-200 hover:bg-blue-50 hover:px-1 hover:rounded`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {words.map((word, index) => (
          <span
            key={index}
            className={`transition-all duration-200 ${
              isHovering && index === focusWordIndex
                ? 'text-blue-600 font-bold bg-blue-100 px-1 rounded scale-105 inline-block'
                : ''
            }`}
            style={{
              transform: isHovering && index === focusWordIndex 
                ? 'scale(1.1) translateY(-1px)' 
                : 'scale(1)'
            }}
          >
            {word}
          </span>
        ))}
      </span>

      {/* Magnifying Glass Effect */}
      <AnimatePresence>
        {isHovering && magnifiedWord && textBounds && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: textBounds.left + textBounds.width / 2 - 64,
              top: textBounds.top - 140,
            }}
          >
            {/* Magnifier Circle */}
            <div className="relative">
              {/* Circle Background - larger size */}
              <div className="w-32 h-32 bg-gradient-to-br from-white to-blue-50 border-4 border-blue-300 rounded-full shadow-xl flex items-center justify-center">
                <div className="text-center px-2">
                  <span className="text-3xl font-mono font-bold text-blue-700 break-words leading-tight">
                    {magnifiedWord}
                  </span>
                  <div className="text-xs text-blue-500 font-normal mt-1">
                    IPA Symbol
                  </div>
                </div>
              </div>
              
              {/* Handle - larger */}
              <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg transform rotate-45">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mt-2 ml-2"></div>
              </div>
              
              {/* Glass reflection effect */}
              <div className="absolute top-2 left-3 w-4 h-4 bg-white opacity-50 rounded-full blur-sm"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}