"use client";

interface StorageData {
    bookmarks: string[];
    recentlyViewed: {
        id: string;
        timestamp: number;
    }[];
}

// Storage helper with batching
export class PassageStorage {
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
