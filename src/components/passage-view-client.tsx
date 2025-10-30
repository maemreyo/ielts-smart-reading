"use client";

import { useEffect } from 'react';
import { EnhancedReadingViewV2 } from '@/components/enhanced-reading-view-v2';
import { PassageStorage } from '@/lib/passage-storage';

interface PassageViewClientProps {
  title: string;
  paragraphs: string[];
  lexicalItems: any[];
  book: string;
  test: string;
  passage: string;
}

export function PassageViewClient({
  title,
  paragraphs,
  lexicalItems,
  book,
  test,
  passage
}: PassageViewClientProps) {
  useEffect(() => {
    // Track this passage as recently viewed
    const trackRecentView = async () => {
      try {
        const passageId = `${book}-${test}-${passage}`;
        const storageData = await PassageStorage.load();
        PassageStorage.addRecentView(passageId, storageData);
        console.log('Tracked recent view for:', passageId);
      } catch (error) {
        console.error('Failed to track recent view:', error);
      }
    };

    trackRecentView();
  }, [book, test, passage]);

  return (
    <EnhancedReadingViewV2
      title={title}
      paragraphs={paragraphs}
      lexicalItems={lexicalItems}
    />
  );
}