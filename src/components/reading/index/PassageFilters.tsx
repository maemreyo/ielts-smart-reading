"use client";

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Target, X } from 'lucide-react';

export function PassageFilters({
    searchQuery,
    setSearchQuery,
    selectedBook,
    setSelectedBook,
    uniqueBooks,
    selectedDifficulty,
    setSelectedDifficulty
}: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedBook: string;
    setSelectedBook: (book: string) => void;
    uniqueBooks: string[];
    selectedDifficulty: string;
    setSelectedDifficulty: (difficulty: string) => void;
}) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                    placeholder="Search passages by title, book, or test..."
                    className="pl-10 h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
            <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                    <Filter size={16} className="mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Books</SelectItem>
                    {uniqueBooks.map(book => (
                        <SelectItem key={book} value={book}>Cambridge {book}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                    <Target size={16} className="mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
