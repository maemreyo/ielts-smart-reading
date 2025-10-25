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
  const [magnifiedChar, setMagnifiedChar] = useState('');
  const textRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!textRef.current) return;

    const rect = textRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate which character is being hovered
    const charWidth = rect.width / text.length;
    const charIndex = Math.floor(x / charWidth);
    const char = text[charIndex] || '';

    setMousePosition({ x: e.clientX, y: e.clientY });
    setMagnifiedChar(char);
  }, [text]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMagnifiedChar('');
  };

  return (
    <>
      <span
        ref={textRef}
        className={`${className} cursor-crosshair relative select-none`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </span>

      {/* Magnifying Glass Effect */}
      <AnimatePresence>
        {isHovering && magnifiedChar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: mousePosition.x + 20,
              top: mousePosition.y - 50,
            }}
          >
            {/* Magnifier Circle */}
            <div className="relative">
              {/* Circle Background */}
              <div className="w-16 h-16 bg-white border-4 border-gray-400 rounded-full shadow-lg flex items-center justify-center">
                <span className="text-2xl font-mono font-bold text-gray-800">
                  {magnifiedChar}
                </span>
              </div>
              
              {/* Handle */}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gray-400 rounded-full shadow-md">
                <div className="w-3 h-3 bg-gray-500 rounded-full mt-1.5 ml-1.5"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}