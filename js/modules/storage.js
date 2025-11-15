/**
 * Storage Module
 * Handles data persistence using links.json and LocalStorage
 */

export class StorageManager {
    constructor() {
        this.links = [];
        this.localStorage_key = 'linksmith_user_data';
    }

    /**
     * Initialize storage and load data
     */
    async init() {
        await this.loadLinks();
        this.loadUserData();
    }

    /**
     * Load links from links.json
     */
    async loadLinks() {
        try {
            const response = await fetch('data/links.json');
            if (response.ok) {
                const data = await response.json();
                this.links = data.links || [];
            } else {
                this.links = [];
            }
        } catch (error) {
            console.warn('No links.json found, starting with empty array');
            this.links = [];
        }
    }

    /**
     * Load user-specific data from LocalStorage
     * (status changes, frozen items, skipped items)
     */
    loadUserData() {
        try {
            const data = localStorage.getItem(this.localStorage_key);
            if (data) {
                const userData = JSON.parse(data);
                this.mergeUserData(userData);
            }
        } catch (error) {
            console.error('Error loading user data from LocalStorage:', error);
        }
    }

    /**
     * Merge user data (from LocalStorage) with links data
     */
    mergeUserData(userData) {
        const { statuses = {}, frozen = {}, skippedInSession = [] } = userData;

        this.links = this.links.map(link => ({
            ...link,
            status: statuses[link.id] || link.status || 'unread',
            frozen: frozen[link.id] || null,
            skippedInSession: skippedInSession.includes(link.id)
        }));
    }

    /**
     * Save user data to LocalStorage
     */
    saveUserData() {
        try {
            const statuses = {};
            const frozen = {};
            const skippedInSession = [];

            this.links.forEach(link => {
                if (link.status && link.status !== 'unread') {
                    statuses[link.id] = link.status;
                }
                if (link.frozen) {
                    frozen[link.id] = link.frozen;
                }
                if (link.skippedInSession) {
                    skippedInSession.push(link.id);
                }
            });

            const userData = { statuses, frozen, skippedInSession };
            localStorage.setItem(this.localStorage_key, JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user data to LocalStorage:', error);
        }
    }

    /**
     * Add new links (used during import)
     */
    addLinks(newLinks) {
        const maxId = this.links.length > 0
            ? Math.max(...this.links.map(l => parseInt(l.id) || 0))
            : 0;

        newLinks.forEach((link, index) => {
            const linkWithId = {
                id: String(maxId + index + 1),
                ...link,
                status: 'unread',
                createdAt: new Date().toISOString()
            };
            this.links.unshift(linkWithId); // Add to beginning (newest first)
        });

        this.saveToJson();
        this.saveUserData();
    }

    /**
     * Update a specific link
     */
    updateLink(id, updates) {
        const index = this.links.findIndex(link => link.id === id);
        if (index !== -1) {
            this.links[index] = { ...this.links[index], ...updates };
            this.saveUserData();
            return this.links[index];
        }
        return null;
    }

    /**
     * Mark link as read
     */
    markAsRead(id) {
        return this.updateLink(id, { status: 'read' });
    }

    /**
     * Mark link as unread
     */
    markAsUnread(id) {
        return this.updateLink(id, { status: 'unread' });
    }

    /**
     * Skip link (mark as skipped in current session)
     */
    skipLink(id) {
        return this.updateLink(id, { skippedInSession: true });
    }

    /**
     * Freeze link for N days
     */
    freezeLink(id, days = 30) {
        const freezeUntil = new Date();
        freezeUntil.setDate(freezeUntil.getDate() + days);
        return this.updateLink(id, {
            frozen: freezeUntil.toISOString(),
            status: 'frozen'
        });
    }

    /**
     * Unfreeze link
     */
    unfreezeLink(id) {
        return this.updateLink(id, {
            frozen: null,
            status: 'unread'
        });
    }

    /**
     * Get all links
     */
    getAllLinks() {
        return this.links;
    }

    /**
     * Get filtered links
     */
    getFilteredLinks(filters = {}) {
        let filtered = [...this.links];

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(link =>
                link.title.toLowerCase().includes(searchLower) ||
                link.domain.toLowerCase().includes(searchLower) ||
                (link.tags && link.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }

        // Status filter
        if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes('all')) {
            filtered = filtered.filter(link => filters.statuses.includes(link.status));
        }

        // Tag filter
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(link =>
                link.tags && filters.tags.some(tag => link.tags.includes(tag))
            );
        }

        // Platform tag filter
        if (filters.platformTags && filters.platformTags.length > 0) {
            filtered = filtered.filter(link =>
                filters.platformTags.includes(link.platformTag)
            );
        }

        return filtered;
    }

    /**
     * Get random link from filtered pool
     */
    getRandomLink(filters = {}) {
        let pool = this.getFilteredLinks(filters);

        // Exclude frozen links
        const now = new Date();
        pool = pool.filter(link => {
            if (!link.frozen) return true;
            return new Date(link.frozen) < now;
        });

        // Exclude skipped in session
        pool = pool.filter(link => !link.skippedInSession);

        // Prefer unread
        const unreadPool = pool.filter(link => link.status === 'unread');
        if (unreadPool.length > 0) {
            pool = unreadPool;
        }

        if (pool.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }

    /**
     * Get all unique tags
     */
    getAllTags() {
        const tagSet = new Set();
        this.links.forEach(link => {
            if (link.tags) {
                link.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    }

    /**
     * Get all unique platform tags
     */
    getAllPlatformTags() {
        const platformTagSet = new Set();
        this.links.forEach(link => {
            if (link.platformTag) {
                platformTagSet.add(link.platformTag);
            }
        });
        return Array.from(platformTagSet).sort();
    }

    /**
     * Get statistics
     */
    getStats() {
        const total = this.links.length;
        const unread = this.links.filter(l => l.status === 'unread').length;
        const read = this.links.filter(l => l.status === 'read').length;
        const frozen = this.links.filter(l => l.status === 'frozen').length;

        return { total, unread, read, frozen };
    }

    /**
     * Save entire links array to JSON (for export/backup)
     * Note: In a real static site, this would need a backend or manual update
     */
    saveToJson() {
        // This is a placeholder - in real usage, user would need to manually
        // update links.json or use a backend service
        console.info('Links updated. Total:', this.links.length);

        // For development/testing, we can provide a download
        const dataStr = JSON.stringify({ links: this.links }, null, 2);
        console.log('Updated links.json content (copy this to data/links.json):');
        console.log(dataStr);
    }

    /**
     * Export data as downloadable JSON
     */
    exportData() {
        const dataStr = JSON.stringify({ links: this.links }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `linksmith-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Clear session-specific data (e.g., skipped items)
     */
    clearSessionData() {
        this.links = this.links.map(link => ({
            ...link,
            skippedInSession: false
        }));
        this.saveUserData();
    }
}
