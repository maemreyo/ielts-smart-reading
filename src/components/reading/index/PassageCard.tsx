"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, FileText, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react';
import { DifficultyBadge } from './DifficultyBadge';

// Define the PassageInfo type right here or import from a shared types file
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

export function PassageCard({
    passage,
    isBookmarked,
    onToggleBookmark,
    onView
}: {
    passage: PassageInfo;
    isBookmarked: boolean;
    onToggleBookmark: () => void;
    onView: () => void;
}) {
    return (
        <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/50 relative">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onToggleBookmark();
                }}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all"
                title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
                <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                >
                    {isBookmarked ? (
                        <BookmarkCheck size={18} className="text-primary fill-primary" />
                    ) : (
                        <Bookmark size={18} className="text-muted-foreground" />
                    )}
                </motion.div>
            </button>

            <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2 pr-8">
                    <Badge variant="secondary" className="shrink-0">
                        Passage {passage.passage}
                    </Badge>
                    <DifficultyBadge difficulty={passage.difficulty} />
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {passage.title}
                </CardTitle>
                <CardDescription>
                    Cambridge IELTS {passage.book} • {passage.test.replace('test-', 'Test ')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
                    <span className="flex items-center gap-1.5">
                        <FileText size={14} />
                        <span className="font-medium">{passage.wordCount.toLocaleString()}</span> words
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span className="font-medium">{passage.readingTime}</span> min
                    </span>
                </div>

                <div className="space-y-2">
                    <Link
                        href={`/reading/${passage.book}/${passage.test}/${passage.passage}`}
                        onClick={onView}
                        className="block"
                    >
                        <div className="w-full text-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                            <BookOpen size={16} />
                            Start Reading
                        </div>
                    </Link>

                    <Link
                        href={`/self-learning/${passage.book}/${passage.test}/${passage.passage}`}
                        onClick={onView}
                        className="block"
                    >
                        <div className="w-full text-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                            <Sparkles size={16} />
                            Self-Learning
                        </div>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
