"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhoneticZoomProps {
  text: string;
  className?: string;
}

export function PhoneticZoom({ text, className = "" }: PhoneticZoomProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [focusIndex, setFocusIndex] = useState(-1);
  const textRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!textRef.current) return;

    const rect = textRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Calculate which character is being hovered
    const charWidth = rect.width / text.length;
    const charIndex = Math.floor(x / charWidth);

    setMousePosition({ x: e.clientX, y: e.clientY });
    setFocusIndex(Math.max(0, Math.min(charIndex, text.length - 1)));
  }, [text]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setFocusIndex(-1);
  };

  // Get surrounding characters for context (3 chars before, focus char, 3 chars after)
  const getMagnifiedText = () => {
    if (focusIndex === -1) return '';
    
    const start = Math.max(0, focusIndex - 3);
    const end = Math.min(text.length, focusIndex + 4);
    return text.slice(start, end);
  };

  const getFocusCharIndex = () => {
    if (focusIndex === -1) return -1;
    const start = Math.max(0, focusIndex - 3);
    return focusIndex - start;
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
        {text.split('').map((char, index) => (
          <span
            key={index}
            className={`transition-all duration-200 ${
              isHovering && Math.abs(index - focusIndex) <= 1
                ? 'text-blue-600 font-bold scale-110 inline-block'
                : ''
            }`}
            style={{
              transform: isHovering && index === focusIndex 
                ? 'scale(1.3) translateY(-1px)' 
                : isHovering && Math.abs(index - focusIndex) === 1
                ? 'scale(1.1)'
                : 'scale(1)'
            }}
          >
            {char}
          </span>
        ))}
      </span>

      {/* Floating Magnified View */}
      <AnimatePresence>
        {isHovering && focusIndex !== -1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: mousePosition.x - 80,
              top: mousePosition.y - 80,
            }}
          >
            {/* Glass Effect Container */}
            <div className="relative">
              {/* Main magnifier circle */}
              <div className="w-64 h-64 bg-gradient-to-br from-white to-gray-50 border-4 border-gray-300 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-gray-800 mb-1">
                    {getMagnifiedText().split('').map((char, index) => (
                      <span
                        key={index}
                        className={`${
                          index === getFocusCharIndex()
                            ? 'text-blue-600 text-4xl'
                            : 'text-gray-500'
                        } transition-all duration-200`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 font-normal">
                    IPA Phonetic
                  </div>
                </div>
              </div>
              
              {/* Magnifier handle */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-lg transform rotate-45">
                <div className="w-4 h-4 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full mt-2 ml-2"></div>
              </div>

              {/* Glass reflection effect */}
              <div className="absolute top-2 left-4 w-6 h-6 bg-white opacity-40 rounded-full blur-sm"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}