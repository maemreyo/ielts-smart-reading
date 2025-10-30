"use client";

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    BookOpen,
    Clock,
    FileText,
    Search,
    Filter,
    TrendingUp,
    BarChart3,
    Target,
    Sparkles,
    Bookmark,
    BookmarkCheck,
    History,
    X
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';


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

// Storage helper with batching
class PassageStorage {
    private static STORAGE_KEY = 'passage-data';
    private static MAX_RECENT = 10;
    private static saveTimeout: NodeJS.Timeout | null = null;
    private static pendingData: StorageData | null = null;

    static async load(): Promise<StorageData> {
        if (typeof window === 'undefined' || !window.localStorage) {
            return { bookmarks: [], recentlyViewed: [] };
        }

        try {
            const result = window.localStorage.getItem(this.STORAGE_KEY);
            if (result) {
                return JSON.parse(result);
            }
        } catch (error) {
            console.log('No existing data, starting fresh');
        }
        return { bookmarks: [], recentlyViewed: [] };
    }

    static scheduleSave(data: StorageData) {
        if (typeof window === 'undefined' || !window.localStorage) return;

        this.pendingData = data;

        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(async () => {
            if (this.pendingData) {
                try {
                    window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pendingData));
                    console.log('Data saved successfully');
                } catch (error) {
                    console.error('Failed to save data:', error);
                }
                this.pendingData = null;
            }
        }, 1000);
    }

    static saveNow(data: StorageData) {
        if (typeof window === 'undefined' || !window.localStorage) return;

        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
        try {
            window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            console.log('Data saved immediately');
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    static toggleBookmark(passageId: string, currentData: StorageData): StorageData {
        const newBookmarks = currentData.bookmarks.includes(passageId)
            ? currentData.bookmarks.filter(id => id !== passageId)
            : [...currentData.bookmarks, passageId];

        const newData = { ...currentData, bookmarks: newBookmarks };
        this.saveNow(newData);
        return newData;
    }

    static addRecentView(passageId: string, currentData: StorageData): StorageData {
        const filtered = currentData.recentlyViewed.filter(item => item.id !== passageId);
        const newRecent = [
            { id: passageId, timestamp: Date.now() },
            ...filtered
        ].slice(0, this.MAX_RECENT);

        const newData = { ...currentData, recentlyViewed: newRecent };
        this.scheduleSave(newData);
        return newData;
    }
}

function StatsCard({ icon: Icon, label, value, trend }: {
    icon: any;
    label: string;
    value: string | number;
    trend?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {trend && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <TrendingUp size={12} />
                                {trend}
                            </p>
                        )}
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DifficultyBadge({ difficulty }: { difficulty?: 'easy' | 'medium' | 'hard' }) {
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

function PassageCard({
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

export default function ReadingIndexClient({ initialPassages }: { initialPassages: PassageInfo[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBook, setSelectedBook] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [activeTab, setActiveTab] = useState('all');
    const [storageData, setStorageData] = useState<StorageData>({ bookmarks: [], recentlyViewed: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        PassageStorage.load().then(data => {
            setStorageData(data);
            setIsLoading(false);
        });
    }, []);

    const availablePassages = initialPassages.filter(p => p.available);
    const unavailablePassages = initialPassages.filter(p => !p.available);

    const filteredPassages = useMemo(() => {
        let filtered = availablePassages;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.book.includes(query) ||
                p.test.includes(query)
            );
        }

        if (selectedBook !== 'all') {
            filtered = filtered.filter(p => p.book === selectedBook);
        }

        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
        }

        return filtered;
    }, [availablePassages, searchQuery, selectedBook, selectedDifficulty]);

    const easyPassages = useMemo(() =>
        filteredPassages.filter(p => p.difficulty === 'easy'),
        [filteredPassages]
    );
    const mediumPassages = useMemo(() =>
        filteredPassages.filter(p => p.difficulty === 'medium'),
        [filteredPassages]
    );
    const hardPassages = useMemo(() =>
        filteredPassages.filter(p => p.difficulty === 'hard'),
        [filteredPassages]
    );

    const bookmarkedPassages = useMemo(() =>
        availablePassages.filter(p =>
            storageData.bookmarks.includes(`${p.book}-${p.test}-${p.passage}`)
        ),
        [availablePassages, storageData.bookmarks]
    );

    const recentPassages = useMemo(() => {
        return storageData.recentlyViewed
            .map(item => {
                const [book, test, passage] = item.id.split('-');
                return availablePassages.find(p =>
                    p.book === book && p.test === test && p.passage === passage
                );
            })
            .filter(Boolean) as PassageInfo[];
    }, [availablePassages, storageData.recentlyViewed]);

    const groupedPassages = useMemo(() => {
        return filteredPassages.reduce((acc, passage) => {
            const key = `${passage.book}-${passage.test}`;
            if (!acc[key]) {
                acc[key] = {
                    book: passage.book,
                    test: passage.test,
                    passages: []
                };
            }
            acc[key].passages.push(passage);
            return acc;
        }, {} as Record<string, { book: string; test: string; passages: PassageInfo[] }>);
    }, [filteredPassages]);

    const handleToggleBookmark = async (passage: PassageInfo) => {
        const passageId = `${passage.book}-${passage.test}-${passage.passage}`;
        const newData = await PassageStorage.toggleBookmark(passageId, storageData);
        setStorageData(newData);
    };

    const handleViewPassage = (passage: PassageInfo) => {
        const passageId = `${passage.book}-${passage.test}-${passage.passage}`;
        const newData = PassageStorage.addRecentView(passageId, storageData);
        setStorageData(newData);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSelectedBook('all');
        setSelectedDifficulty('all');
    };

    const uniqueBooks = Array.from(new Set(availablePassages.map(p => p.book))).sort();
    const hasActiveFilters = searchQuery || selectedBook !== 'all' || selectedDifficulty !== 'all';

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading passages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto p-6 max-w-7xl">
                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
                        <Sparkles size={16} />
                        Enhanced Learning Experience
                    </div>
                    <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        IELTS Reading Practice
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Master IELTS Reading with lexical analysis, interactive features, and personalized learning paths
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid gap-4 md:grid-cols-4 mb-12">
                    <StatsCard
                        icon={FileText}
                        label="Total Passages"
                        value={availablePassages.length}
                    />
                    <StatsCard
                        icon={BookOpen}
                        label="Test Sets"
                        value={Object.keys(groupedPassages).length}
                    />
                    <StatsCard
                        icon={Bookmark}
                        label="Bookmarked"
                        value={storageData.bookmarks.length}
                    />
                    <StatsCard
                        icon={History}
                        label="Recently Viewed"
                        value={storageData.recentlyViewed.length}
                    />
                </div>

                {/* Recently Viewed Section */}
                {recentPassages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <History size={24} />
                                Continue Reading
                            </h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {recentPassages.slice(0, 3).map((passage) => (
                                <PassageCard
                                    key={`recent-${passage.book}-${passage.test}-${passage.passage}`}
                                    passage={passage}
                                    isBookmarked={storageData.bookmarks.includes(`${passage.book}-${passage.test}-${passage.passage}`)}
                                    onToggleBookmark={() => handleToggleBookmark(passage)}
                                    onView={() => handleViewPassage(passage)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Filters & Search */}
                <div className="mb-8">
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

                    <AnimatePresence>
                        {hasActiveFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                                <span>Showing {filteredPassages.length} of {availablePassages.length} passages</span>
                                <Button variant="ghost" size="sm" onClick={clearSearch} className="h-7 text-xs">
                                    Clear filters
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid w-full max-w-2xl grid-cols-5">
                        <TabsTrigger value="all">All ({filteredPassages.length})</TabsTrigger>
                        <TabsTrigger value="bookmarks">
                            <Bookmark size={14} className="mr-1" />
                            ({bookmarkedPassages.length})
                        </TabsTrigger>
                        <TabsTrigger value="easy">Easy ({easyPassages.length})</TabsTrigger>
                        <TabsTrigger value="medium">Medium ({mediumPassages.length})</TabsTrigger>
                        <TabsTrigger value="hard">Hard ({hardPassages.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-8">
                        {filteredPassages.length === 0 ? (
                            <div className="text-center py-12">
                                <Search size={48} className="mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No passages found</h3>
                                <p className="text-muted-foreground">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {Object.values(groupedPassages).map(({ book, test, passages }) => (
                                    <div key={`${book}-${test}`}>
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-3xl font-bold">Cambridge IELTS {book}</h2>
                                                <p className="text-muted-foreground mt-1">
                                                    {test.replace('test-', 'Test ')} • {passages.length} passages
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-sm px-3 py-1">
                                                {passages.reduce((sum, p) => sum + p.readingTime, 0)} min total
                                            </Badge>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {passages.map((passage) => (
                                                <PassageCard
                                                    key={`${book}-${test}-${passage.passage}`}
                                                    passage={passage}
                                                    isBookmarked={storageData.bookmarks.includes(`${passage.book}-${passage.test}-${passage.passage}`)}
                                                    onToggleBookmark={() => handleToggleBookmark(passage)}
                                                    onView={() => handleViewPassage(passage)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="bookmarks" className="mt-8">
                        {bookmarkedPassages.length === 0 ? (
                            <div className="text-center py-12">
                                <Bookmark size={48} className="mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
                                <p className="text-muted-foreground">Bookmark passages to access them quickly later</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {bookmarkedPassages.map((passage) => (
                                    <PassageCard
                                        key={`bookmark-${passage.book}-${passage.test}-${passage.passage}`}
                                        passage={passage}
                                        isBookmarked={true}
                                        onToggleBookmark={() => handleToggleBookmark(passage)}
                                        onView={() => handleViewPassage(passage)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="easy" className="mt-8">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {easyPassages.map((passage) => (
                                <PassageCard
                                    key={`easy-${passage.book}-${passage.test}-${passage.passage}`}
                                    passage={passage}
                                    isBookmarked={storageData.bookmarks.includes(`${passage.book}-${passage.test}-${passage.passage}`)}
                                    onToggleBookmark={() => handleToggleBookmark(passage)}
                                    onView={() => handleViewPassage(passage)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="medium" className="mt-8">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {mediumPassages.map((passage) => (
                                <PassageCard
                                    key={`medium-${passage.book}-${passage.test}-${passage.passage}`}
                                    passage={passage}
                                    isBookmarked={storageData.bookmarks.includes(`${passage.book}-${passage.test}-${passage.passage}`)}
                                    onToggleBookmark={() => handleToggleBookmark(passage)}
                                    onView={() => handleViewPassage(passage)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="hard" className="mt-8">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {hardPassages.map((passage) => (
                                <PassageCard
                                    key={`hard-${passage.book}-${passage.test}-${passage.passage}`}
                                    passage={passage}
                                    isBookmarked={storageData.bookmarks.includes(`${passage.book}-${passage.test}-${passage.passage}`)}
                                    onToggleBookmark={() => handleToggleBookmark(passage)}
                                    onView={() => handleViewPassage(passage)}
                                />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Coming Soon */}
                {unavailablePassages.length > 0 && (
                    <div className="mt-16 pt-12 border-t">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-muted-foreground mb-2">Coming Soon</h2>
                            <p className="text-muted-foreground">More passages are being prepared for you</p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {unavailablePassages.slice(0, 6).map((passage) => (
                                <Card key={`${passage.book}-${passage.test}-${passage.passage}`} className="opacity-60 grayscale">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge variant="outline">Passage {passage.passage}</Badge>
                                            <Badge variant="secondary">Soon</Badge>
                                        </div>
                                        <CardTitle className="text-lg">{passage.title}</CardTitle>
                                        <CardDescription>
                                            Cambridge IELTS {passage.book} • {passage.test.replace('test-', 'Test ')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-11 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                                            Under Development
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}