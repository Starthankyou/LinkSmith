/**
 * Import Module
 * Handles bulk URL import and metadata extraction
 */

export class ImportManager {
    constructor(storageManager) {
        this.storage = storageManager;
    }

    /**
     * Parse URLs from text input
     */
    parseUrls(text) {
        const lines = text.split('\n');
        const urls = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && this.isValidUrl(trimmed)) {
                urls.push(trimmed);
            }
        });

        return urls;
    }

    /**
     * Validate URL
     */
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    /**
     * Extract domain from URL
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (_) {
            return 'unknown';
        }
    }

    /**
     * Determine platform tag based on domain
     */
    getPlatformTag(domain) {
        const platformMap = {
            'youtube.com': 'youtube',
            'youtu.be': 'youtube',
            'vimeo.com': 'vimeo',
            'twitter.com': 'twitter',
            'x.com': 'twitter',
            'facebook.com': 'facebook',
            'instagram.com': 'instagram',
            'linkedin.com': 'linkedin',
            'reddit.com': 'reddit',
            'medium.com': 'medium',
            'github.com': 'github',
            'stackoverflow.com': 'stackoverflow',
            'dev.to': 'dev',
            'substack.com': 'substack',
            'tiktok.com': 'tiktok',
            'twitch.tv': 'twitch'
        };

        for (const [key, value] of Object.entries(platformMap)) {
            if (domain.includes(key)) {
                return value;
            }
        }

        // Categorize by common patterns
        if (domain.includes('blog') || domain.includes('medium')) {
            return 'blog';
        }
        if (domain.includes('news')) {
            return 'news';
        }

        return 'article';
    }

    /**
     * Fetch page title (simplified - may face CORS issues)
     */
    async fetchTitle(url) {
        // Note: Due to CORS restrictions, this may not work for all sites
        // In a real implementation, you might use a backend proxy or browser extension
        try {
            // For now, we'll extract from URL or use a simple heuristic
            const urlObj = new URL(url);
            const path = urlObj.pathname;

            // Try to extract meaningful title from URL path
            if (path && path.length > 1) {
                const pathParts = path.split('/').filter(p => p);
                if (pathParts.length > 0) {
                    const lastPart = pathParts[pathParts.length - 1];
                    // Remove file extensions and convert to readable format
                    const title = lastPart
                        .replace(/\.[^/.]+$/, '') // Remove extension
                        .replace(/[-_]/g, ' ') // Replace - and _ with spaces
                        .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize

                    if (title.length > 3) {
                        return title;
                    }
                }
            }

            // Fallback to domain
            return urlObj.hostname.replace('www.', '');

        } catch (error) {
            return url;
        }
    }

    /**
     * Process a single URL and create link object
     */
    async processUrl(url, batchTags = []) {
        const domain = this.extractDomain(url);
        const platformTag = this.getPlatformTag(domain);
        const title = await this.fetchTitle(url);

        const tags = [...batchTags];
        if (platformTag) {
            // Platform tag is stored separately, not in tags array
        }

        return {
            url,
            title,
            domain,
            platformTag,
            tags: tags.length > 0 ? tags : []
        };
    }

    /**
     * Import multiple URLs
     */
    async importUrls(urlsText, batchTagsText = '') {
        const urls = this.parseUrls(urlsText);

        if (urls.length === 0) {
            throw new Error('No valid URLs found');
        }

        // Parse batch tags
        const batchTags = batchTagsText
            ? batchTagsText.split(',').map(tag => tag.trim()).filter(tag => tag)
            : [];

        // Process all URLs
        const linkPromises = urls.map(url => this.processUrl(url, batchTags));
        const links = await Promise.all(linkPromises);

        // Add to storage
        this.storage.addLinks(links);

        return {
            success: true,
            count: links.length,
            links
        };
    }

    /**
     * Validate import before processing
     */
    validateImport(text) {
        const urls = this.parseUrls(text);
        return {
            valid: urls.length > 0,
            count: urls.length,
            urls
        };
    }
}
