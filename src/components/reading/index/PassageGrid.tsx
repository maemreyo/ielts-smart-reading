"use client";

import { PassageCard } from './PassageCard';
import { Search, Bookmark } from 'lucide-react';

// Define the PassageInfo and StorageData types or import from a shared types file
interface PassageInfo {
    book: string;
    test: string;
    passage: string;
    title: string;
    wordCount: number;
    readingTime: number;
    available: boolean;
    difficulty?: 'easy' | 'medium' | 'hard';
}

interface StorageData {
    bookmarks: string[];
    recentlyViewed: {
        id: string;
        timestamp: number;
    }[];
}

export function PassageGrid({
    passages,
    storageData,
    handleToggleBookmark,
    handleViewPassage,
    emptyState
}: {
    passages: PassageInfo[];
    storageData: StorageData;
    handleToggleBookmark: (passage: PassageInfo) => void;
    handleViewPassage: (passage: PassageInfo) => void;
    emptyState?: {
        icon: React.ElementType;
        title: string;
        message: string;
    }
}) {
    if (passages.length === 0 && emptyState) {
        const Icon = emptyState.icon;
        return (
            <div className="text-center py-12">
                <Icon size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{emptyState.title}</h3>
                <p className="text-muted-foreground">{emptyState.message}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {passages.map((passage) => (
                <PassageCard
                    key={`grid-${passage.book}-${passage.test}-${passage.passage}`}
                    passage={passage}
                    isBookmarked={storageData.bookmarks.includes(`${passage.book}-${passage.test}-${passage.passage}`)}
                    onToggleBookmark={() => handleToggleBookmark(passage)}
                    onView={() => handleViewPassage(passage)}
                />
            ))}
        </div>
    );
}
