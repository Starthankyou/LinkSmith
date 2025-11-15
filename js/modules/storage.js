/**
 * Storage Module
 * Handles data persistence using links.json and LocalStorage
 */

export class StorageManager {
    constructor() {
        this.links = [];
        this.localStorage_key = 'linksmith_user_data';
        this.localStorage_links_key = 'linksmith_user_links'; // Store complete user links
    }

    /**
     * Initialize storage and load data
     */
    async init() {
        await this.loadLinks();
        this.loadUserLinks(); // Load user-imported links from LocalStorage
        this.loadUserData();   // Merge user-specific data (status, frozen, etc.)
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
     * Load user-imported links from LocalStorage
     * This persists user-added links across page refreshes
     */
    loadUserLinks() {
        try {
            const data = localStorage.getItem(this.localStorage_links_key);
            if (data) {
                const userLinks = JSON.parse(data);
                // Merge user links with base links (user links take precedence)
                if (Array.isArray(userLinks) && userLinks.length > 0) {
                    // Create a map of existing link IDs
                    const existingIds = new Set(this.links.map(l => l.id));

                    // Add user links that don't already exist
                    userLinks.forEach(link => {
                        if (!existingIds.has(link.id)) {
                            // Ensure backward compatibility: add new fields if missing
                            const linkWithDefaults = {
                                rating: null,
                                viewCount: 0,
                                lastViewed: null,
                                skipCount: 0,
                                implicitScore: 0.5,
                                ...link // User data overrides defaults
                            };
                            this.links.push(linkWithDefaults);
                        }
                    });

                    console.log(`Loaded ${userLinks.length} user links from LocalStorage`);
                }
            }
        } catch (error) {
            console.error('Error loading user links from LocalStorage:', error);
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
     * Save all links to LocalStorage
     * This persists the complete links array including user-imported links
     */
    saveAllLinks() {
        try {
            localStorage.setItem(this.localStorage_links_key, JSON.stringify(this.links));
            console.log(`Saved ${this.links.length} links to LocalStorage`);
        } catch (error) {
            console.error('Error saving links to LocalStorage:', error);
            // If quota exceeded, try to save only user-added links
            if (error.name === 'QuotaExceededError') {
                console.warn('LocalStorage quota exceeded. Consider exporting your data.');
            }
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
                createdAt: new Date().toISOString(),
                // Rating and tracking fields
                rating: null,           // 1-5 star rating (null = not rated)
                viewCount: 0,           // Number of times opened
                lastViewed: null,       // Last view timestamp
                skipCount: 0,           // Number of times skipped
                implicitScore: 0.5      // Auto-calculated score 0-1
            };
            this.links.unshift(linkWithId); // Add to beginning (newest first)
        });

        this.saveAllLinks();  // Save complete links to LocalStorage
        this.saveUserData();  // Save user metadata
        this.saveToJson();    // Console log for debugging
    }

    /**
     * Update a specific link
     */
    updateLink(id, updates) {
        const index = this.links.findIndex(link => link.id === id);
        if (index !== -1) {
            this.links[index] = { ...this.links[index], ...updates };
            this.saveAllLinks();  // Save complete links to LocalStorage
            this.saveUserData();  // Save user metadata
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
     * Soft delete link (mark as deleted but don't remove)
     */
    deleteLink(id) {
        return this.updateLink(id, {
            deleted: true,
            deletedAt: new Date().toISOString()
        });
    }

    /**
     * Restore deleted link
     */
    restoreLink(id) {
        return this.updateLink(id, {
            deleted: false,
            deletedAt: null
        });
    }

    /**
     * Permanently delete link (hard delete)
     */
    permanentlyDeleteLink(id) {
        const index = this.links.findIndex(link => link.id === id);
        if (index !== -1) {
            this.links.splice(index, 1);
            this.saveAllLinks();  // Save complete links to LocalStorage
            this.saveUserData();  // Save user metadata
            return true;
        }
        return false;
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

        // Exclude deleted links (unless explicitly requesting them)
        if (!filters.includeDeleted) {
            filtered = filtered.filter(link => !link.deleted);
        }

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
        const activeLinks = this.links.filter(l => !l.deleted);
        const total = activeLinks.length;
        const unread = activeLinks.filter(l => l.status === 'unread').length;
        const read = activeLinks.filter(l => l.status === 'read').length;
        const frozen = activeLinks.filter(l => l.status === 'frozen').length;
        const deleted = this.links.filter(l => l.deleted).length;

        return { total, unread, read, frozen, deleted };
    }

    /**
     * Get all deleted links
     */
    getDeletedLinks() {
        return this.links.filter(link => link.deleted);
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

    /* ============================================================
       Rating and Recommendation System
       ============================================================ */

    /**
     * Rate a link (1-5 stars)
     */
    rateLink(id, rating) {
        if (rating < 1 || rating > 5) {
            console.error('Rating must be between 1 and 5');
            return null;
        }

        const updated = this.updateLink(id, { rating });

        // Recalculate implicit score
        if (updated) {
            const implicitScore = this.calculateImplicitScore(updated);
            this.updateLink(id, { implicitScore });
        }

        return updated;
    }

    /**
     * Increment view count and update last viewed time
     */
    incrementViewCount(id) {
        const link = this.links.find(l => l.id === id);
        if (link) {
            const viewCount = (link.viewCount || 0) + 1;
            const lastViewed = new Date().toISOString();
            const updated = this.updateLink(id, { viewCount, lastViewed });

            // Recalculate implicit score
            if (updated) {
                const implicitScore = this.calculateImplicitScore(updated);
                this.updateLink(id, { implicitScore });
            }

            return updated;
        }
        return null;
    }

    /**
     * Increment skip count
     */
    incrementSkipCount(id) {
        const link = this.links.find(l => l.id === id);
        if (link) {
            const skipCount = (link.skipCount || 0) + 1;
            const updated = this.updateLink(id, { skipCount });

            // Recalculate implicit score
            if (updated) {
                const implicitScore = this.calculateImplicitScore(updated);
                this.updateLink(id, { implicitScore });
            }

            return updated;
        }
        return null;
    }

    /**
     * Calculate implicit score based on user behavior (0-1)
     */
    calculateImplicitScore(link) {
        let score = 0.5; // Base score

        // Positive signals
        if (link.status === 'read') score += 0.25;
        if (link.viewCount > 0) {
            score += Math.min(0.15, link.viewCount * 0.05); // Cap at +0.15
        }

        // Negative signals
        if (link.skipCount > 0) {
            score -= Math.min(0.3, link.skipCount * 0.15); // Cap at -0.3
        }
        if (link.frozen) score -= 0.35;
        if (link.deleted) score = 0;

        // Clamp between 0 and 1
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Get user preferences based on ratings and behavior
     */
    getUserPreferences() {
        const preferences = {
            tagPreferences: {},      // Tag slug -> average score
            platformPreferences: {}, // Platform -> average score
            totalRated: 0,
            averageRating: 0
        };

        const activeLinks = this.links.filter(l => !l.deleted);
        let totalRating = 0;
        let ratedCount = 0;

        activeLinks.forEach(link => {
            // Calculate effective score (rating if available, otherwise implicit)
            const effectiveScore = link.rating || link.implicitScore || 0.5;

            // Track ratings
            if (link.rating) {
                totalRating += link.rating;
                ratedCount++;
            }

            // Tag preferences
            if (link.tags && Array.isArray(link.tags)) {
                link.tags.forEach(tag => {
                    if (!preferences.tagPreferences[tag]) {
                        preferences.tagPreferences[tag] = { total: 0, count: 0 };
                    }
                    preferences.tagPreferences[tag].total += effectiveScore;
                    preferences.tagPreferences[tag].count++;
                });
            }

            // Platform preferences
            if (link.platformTag) {
                if (!preferences.platformPreferences[link.platformTag]) {
                    preferences.platformPreferences[link.platformTag] = { total: 0, count: 0 };
                }
                preferences.platformPreferences[link.platformTag].total += effectiveScore;
                preferences.platformPreferences[link.platformTag].count++;
            }
        });

        // Calculate averages
        Object.keys(preferences.tagPreferences).forEach(tag => {
            const pref = preferences.tagPreferences[tag];
            preferences.tagPreferences[tag] = pref.total / pref.count;
        });

        Object.keys(preferences.platformPreferences).forEach(platform => {
            const pref = preferences.platformPreferences[platform];
            preferences.platformPreferences[platform] = pref.total / pref.count;
        });

        preferences.totalRated = ratedCount;
        preferences.averageRating = ratedCount > 0 ? totalRating / ratedCount : 0;

        return preferences;
    }

    /**
     * Calculate recommendation score for a link (0-1)
     */
    calculateRecommendationScore(link, userPreferences) {
        if (!link || link.deleted) return 0;

        // 1. Base score (rating if available, otherwise implicit)
        const baseScore = link.rating ? link.rating / 5 : (link.implicitScore || 0.5);

        // 2. Tag similarity score
        let tagScore = 0;
        let tagMatches = 0;
        if (link.tags && Array.isArray(link.tags)) {
            link.tags.forEach(tag => {
                if (userPreferences.tagPreferences[tag]) {
                    tagScore += userPreferences.tagPreferences[tag];
                    tagMatches++;
                }
            });
        }
        const avgTagScore = tagMatches > 0 ? tagScore / tagMatches / 5 : 0.5;

        // 3. Platform preference
        let platformScore = 0.5;
        if (link.platformTag && userPreferences.platformPreferences[link.platformTag]) {
            platformScore = userPreferences.platformPreferences[link.platformTag] / 5;
        }

        // 4. Recency factor (newer content gets slight boost)
        let recencyFactor = 1.0;
        if (link.createdAt) {
            const ageInDays = (Date.now() - new Date(link.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            if (ageInDays < 7) recencyFactor = 1.1;
            else if (ageInDays > 180) recencyFactor = 0.9;
        }

        // 5. Diversity bonus (unrated content gets small boost to avoid filter bubble)
        const diversityBonus = !link.rating && link.viewCount === 0 ? 0.05 : 0;

        // Final score calculation (weighted average)
        const finalScore = (
            baseScore * 0.35 +
            avgTagScore * 0.30 +
            platformScore * 0.20 +
            diversityBonus * 0.15
        ) * recencyFactor;

        return Math.max(0, Math.min(1, finalScore));
    }

    /**
     * Get recommended links (sorted by recommendation score)
     */
    getRecommendedLinks(filters = {}) {
        const userPreferences = this.getUserPreferences();
        const filteredLinks = this.getFilteredLinks(filters);

        // Calculate recommendation score for each link
        const linksWithScores = filteredLinks.map(link => ({
            ...link,
            recommendationScore: this.calculateRecommendationScore(link, userPreferences)
        }));

        // Sort by recommendation score (descending)
        return linksWithScores.sort((a, b) => b.recommendationScore - a.recommendationScore);
    }

    /**
     * Get weighted random link (for Smart Picker)
     * 70% weight to high-scoring content, 30% exploration
     */
    getSmartRandomLink(filters = {}) {
        const pool = this.getFilteredLinks(filters);

        // Exclude frozen and skipped links
        const now = new Date();
        const eligible = pool.filter(link => {
            if (link.frozen && new Date(link.frozen) > now) return false;
            if (link.skippedInSession) return false;
            if (link.status === 'unread' || Math.random() < 0.3) return true; // Prefer unread
            return true;
        });

        if (eligible.length === 0) return null;

        // Calculate weights based on recommendation scores
        const userPreferences = this.getUserPreferences();
        const weighted = eligible.map(link => ({
            link,
            weight: this.calculateRecommendationScore(link, userPreferences)
        }));

        // Add minimum weight for diversity (prevent zero-weight items)
        weighted.forEach(item => {
            item.weight = Math.max(0.1, item.weight);
        });

        // Weighted random selection
        const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of weighted) {
            random -= item.weight;
            if (random <= 0) {
                return item.link;
            }
        }

        // Fallback
        return eligible[0];
    }
}
