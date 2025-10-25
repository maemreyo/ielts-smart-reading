"use client";

import { useState, useEffect } from 'react';

export function ReadingProgressBar() {
  const [width, setWidth] = useState(0);

  const handleScroll = () => {
    const totalScroll = document.documentElement.scrollTop;
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scroll = `${totalScroll / windowHeight * 100}`;

    setWidth(Number(scroll));
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-1 bg-gray-200">
      <div className="h-1 bg-blue-500" style={{ width: `${width}%` }}></div>
    </div>
  );
}
