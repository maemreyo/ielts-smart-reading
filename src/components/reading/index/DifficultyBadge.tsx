"use client";

import { Badge } from '@/components/ui/badge';

export function DifficultyBadge({ difficulty }: { difficulty?: 'easy' | 'medium' | 'hard' }) {
    if (!difficulty) return null;

    const colors = {
        easy: 'bg-green-100 text-green-700 border-green-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        hard: 'bg-red-100 text-red-700 border-red-200'
    };

    return (
        <Badge variant="outline" className={colors[difficulty]}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Badge>
    );
}
