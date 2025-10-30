"use client";

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Bookmark,
    History,
    Search,
    Sparkles,
    FileText
} from 'lucide-react';

// Import extracted logic and components
import { PassageStorage } from '@/lib/passage-storage';
import { StatsCard } from '@/components/reading/index/StatsCard';
import { PassageCard } from '@/components/reading/index/PassageCard';
import { PassageFilters } from '@/components/reading/index/PassageFilters';
import { PassageGrid } from '@/components/reading/index/PassageGrid';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define shared types or import from a central types file
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

    const availablePassages = useMemo(() => initialPassages.filter(p => p.available), [initialPassages]);
    const unavailablePassages = useMemo(() => initialPassages.filter(p => !p.available), [initialPassages]);

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

    const bookmarkedPassages = useMemo(() =>
        availablePassages.filter(p =>
            storageData.bookmarks.includes(`${p.book}-${p.test}-${p.passage}`)
        ),
        [availablePassages, storageData.bookmarks]
    );

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

    const recentPassages = useMemo(() => {
        const recent = storageData.recentlyViewed
            .map(item => {
                // Parse ID correctly: format is "book-test-passage" where test can be "test-1", "test-2", etc.
                // We need to split and reassemble the test part correctly
                const parts = item.id.split('-');
                const book = parts[0];
                const passage = parts[parts.length - 1]; // Last part is the passage number
                const test = parts.slice(1, -1).join('-'); // Everything between book and passage is the test

                return availablePassages.find(p => p.book === book && p.test === test && p.passage === passage);
            })
            .filter(Boolean) as PassageInfo[];

        return recent;
    }, [availablePassages, storageData.recentlyViewed]);

    const groupedPassages = useMemo(() => {
        return filteredPassages.reduce((acc, passage) => {
            const key = `Book ${passage.book} - ${passage.test.replace('test-', 'Test ')}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(passage);
            return acc;
        }, {} as Record<string, PassageInfo[]>);
    }, [filteredPassages]);

    const handleToggleBookmark = (passage: PassageInfo) => {
        const passageId = `${passage.book}-${passage.test}-${passage.passage}`;
        const newData = PassageStorage.toggleBookmark(passageId, storageData);
        setStorageData(newData);
    };

    const handleViewPassage = (passage: PassageInfo) => {
        const passageId = `${passage.book}-${passage.test}-${passage.passage}`;
        const newData = PassageStorage.addRecentView(passageId, storageData);
        setStorageData(newData);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedBook('all');
        setSelectedDifficulty('all');
    };

    const uniqueBooks = useMemo(() => Array.from(new Set(availablePassages.map(p => p.book))).sort(), [availablePassages]);
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

                <div className="grid gap-4 md:grid-cols-4 mb-12">
                    <StatsCard icon={FileText} label="Total Passages" value={availablePassages.length} />
                    <StatsCard icon={BookOpen} label="Test Sets" value={Object.keys(groupedPassages).length} />
                    <StatsCard icon={Bookmark} label="Bookmarked" value={storageData.bookmarks.length} />
                    <StatsCard icon={History} label="Recently Viewed" value={recentPassages.length} />
                </div>

                {recentPassages.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4"><History size={24} /> Continue Reading</h2>
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

                <div className="mb-8">
                    <PassageFilters
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedBook={selectedBook}
                        setSelectedBook={setSelectedBook}
                        uniqueBooks={uniqueBooks}
                        selectedDifficulty={selectedDifficulty}
                        setSelectedDifficulty={setSelectedDifficulty}
                    />
                    <AnimatePresence>
                        {hasActiveFilters && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Showing {filteredPassages.length} of {availablePassages.length} passages</span>
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">Clear filters</Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid w-full max-w-2xl grid-cols-6">
                        <TabsTrigger value="all">All ({filteredPassages.length})</TabsTrigger>
                        <TabsTrigger value="bookmarks">
                            <Bookmark size={14} className="mr-1" />
                            Marked ({bookmarkedPassages.length})
                        </TabsTrigger>
                        <TabsTrigger value="recent">
                            <History size={14} className="mr-1" />
                            Recent ({recentPassages.length})
                        </TabsTrigger>
                        <TabsTrigger value="easy">Easy ({easyPassages.length})</TabsTrigger>
                        <TabsTrigger value="medium">Medium ({mediumPassages.length})</TabsTrigger>
                        <TabsTrigger value="hard">Hard ({hardPassages.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-8">
                        {Object.entries(groupedPassages).length === 0 ? (
                            <PassageGrid passages={[]} emptyState={{ icon: Search, title: "No passages found", message: "Try adjusting your search or filters" }} handleToggleBookmark={handleToggleBookmark} handleViewPassage={handleViewPassage} storageData={storageData} />
                        ) : (
                            <div className="space-y-12">
                                {Object.entries(groupedPassages).map(([groupName, passages]) => (
                                    <div key={groupName}>
                                        <h2 className="text-3xl font-bold mb-6">{groupName}</h2>
                                        <PassageGrid passages={passages} storageData={storageData} handleToggleBookmark={handleToggleBookmark} handleViewPassage={handleViewPassage} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="bookmarks" className="mt-8">
                        <PassageGrid passages={bookmarkedPassages} storageData={storageData} handleToggleBookmark={handleToggleBookmark} handleViewPassage={handleViewPassage} emptyState={{ icon: Bookmark, title: "No bookmarks yet", message: "Bookmark passages to access them quickly later" }} />
                    </TabsContent>

                    <TabsContent value="recent" className="mt-8">
                        <PassageGrid passages={recentPassages} storageData={storageData} handleToggleBookmark={handleToggleBookmark} handleViewPassage={handleViewPassage} emptyState={{ icon: History, title: "No recently viewed passages", message: "Start reading to see your history here" }} />
                    </TabsContent>

                    <TabsContent value="easy" className="mt-8">
                        <PassageGrid passages={easyPassages} storageData={storageData} handleToggleBookmark={handleToggleBookmark} handleViewPassage={handleViewPassage} />
                    </TabsContent>

                    <TabsContent value="medium" className="mt-8">
                        <PassageGrid passages={mediumPassages} storageData={storageData} handleToggleBookmark={handleToggleBookmark} handleViewPassage={handleViewPassage} />
                    </TabsContent>

                    <TabsContent value="hard" className="mt-8">
                        <PassageGrid passages={hardPassages} storageData={storageData} handleToggleBookmark={handleToggleBookmark} handleViewPassage={handleViewPassage} />
                    </TabsContent>
                </Tabs>

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
                                        <CardDescription>Cambridge IELTS {passage.book} • {passage.test.replace('test-', 'Test ')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-11 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">Under Development</div>
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
