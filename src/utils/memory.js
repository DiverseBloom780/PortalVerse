class MemoryManager {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 100; // Limit cache for Pi Zero
    }
    get(key) {
        return this.cache.get(key);
    }

    set(key, value) {
        if (this.cache.size >= this.maxCacheSize) {
            // Remove oldest entries
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }
}
