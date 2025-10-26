"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhoneticZoomProps {
  text: string;
  className?: string;
}

export function PhoneticZoom({ text, className = "" }: PhoneticZoomProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [focusWordIndex, setFocusWordIndex] = useState(-1);
  const textRef = useRef<HTMLSpanElement>(null);

  // Split text into words (accounting for IPA symbols)
  const words = text.split(/(\s+|\/|\[|\]|\(|\)|\.)/g).filter((w) => w.trim());

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!textRef.current) return;

      const rect = textRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Store both global and local mouse positions
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Calculate which word is being hovered
      const charPosition = x / rect.width;
      const wordIndex = Math.floor(charPosition * words.length);
      setFocusWordIndex(Math.max(0, Math.min(wordIndex, words.length - 1)));
    },
    [words.length]
  );

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setFocusWordIndex(-1);
  };

  // Get surrounding words for context (1-2 words before, focus word, 1-2 words after)
  const getMagnifiedText = () => {
    if (focusWordIndex === -1) return "";

    const start = Math.max(0, focusWordIndex - 1);
    const end = Math.min(words.length, focusWordIndex + 2);
    return words.slice(start, end).join("");
  };

  const getFocusWordInContext = () => {
    if (focusWordIndex === -1) return "";
    return words[focusWordIndex] || "";
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
            className={`mr-1 transition-all duration-200 ${
              isHovering && index === focusWordIndex
                ? "text-blue-600 font-bold bg-blue-100 px-1 rounded scale-105 inline-block"
                : isHovering && Math.abs(index - focusWordIndex) === 1
                ? "text-blue-500 scale-102 inline-block"
                : ""
            }`}
            style={{
              transform:
                isHovering && index === focusWordIndex
                  ? "scale(1.1) translateY(-1px)"
                  : isHovering && Math.abs(index - focusWordIndex) === 1
                  ? "scale(1.05)"
                  : "scale(1)",
            }}
          >
            {word}
          </span>
        ))}
      </span>

      {/* Floating Magnified View */}
      <AnimatePresence>
        {isHovering && focusWordIndex !== -1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: "80%",
              top: "20%",
              translateX: "-50%",
              translateY: "-50%",
            }}
          >
            {/* Glass Effect Container */}
            <div className="relative">
              {/* Main magnifier circle - larger size */}
              <div className="w-80 h-80 bg-gradient-to-br from-white to-gray-50 border-4 border-gray-300 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="text-center px-4">
                  {/* Focus word - much larger */}
                  <div className="text-4xl font-mono font-bold text-blue-600 mb-2 break-words">
                    {getFocusWordInContext()}
                  </div>
                  {/* Context text - smaller */}
                  <div className="text-lg font-mono text-gray-500 mb-2 leading-tight">
                    {getMagnifiedText()}
                  </div>
                  {/* <div className="text-xs text-gray-500 font-normal">
                    IPA Phonetic Zoom
                  </div> */}
                </div>
              </div>

              {/* Magnifier handle - larger */}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-lg transform rotate-45">
                <div className="w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full mt-3 ml-3"></div>
              </div>

              {/* Glass reflection effect */}
              <div className="absolute top-4 left-8 w-8 h-8 bg-white opacity-40 rounded-full blur-sm"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
