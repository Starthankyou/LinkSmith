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
     * Supports two formats:
     * 1. Simple: one URL per line
     * 2. Structured: URL | Title | Tags | Description
     */
    parseUrls(text) {
        const lines = text.split('\n');
        const urls = [];

        lines.forEach(line => {
            const trimmed = line.trim();

            // Skip comments and empty lines
            if (!trimmed || trimmed.startsWith('#')) {
                return;
            }

            // Check if line contains structured format (with |)
            if (trimmed.includes('|')) {
                const parsed = this.parseStructuredLine(trimmed);
                if (parsed) {
                    urls.push(parsed);
                }
            } else if (this.isValidUrl(trimmed)) {
                // Simple format: just URL
                urls.push({ url: trimmed });
            }
        });

        return urls;
    }

    /**
     * Parse structured line format: URL | Title | Tags | Description
     */
    parseStructuredLine(line) {
        const parts = line.split('|').map(p => p.trim());

        const url = parts[0] || '';
        const title = parts[1] || '';
        const tags = parts[2] || '';
        const description = parts[3] || '';

        // Validate URL
        if (!this.isValidUrl(url)) {
            return null;
        }

        // Parse tags
        const tagList = tags
            ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            : [];

        return {
            url,
            title: title || null,
            tags: tagList,
            description: description || null
        };
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
     * @param {string|object} urlData - Either a URL string or structured object
     * @param {array} batchTags - Tags to add to all links
     */
    async processUrl(urlData, batchTags = []) {
        // Handle both simple URL string and structured object
        let url, providedTitle, providedTags, description;

        if (typeof urlData === 'string') {
            url = urlData;
            providedTitle = null;
            providedTags = [];
            description = null;
        } else {
            url = urlData.url;
            providedTitle = urlData.title;
            providedTags = urlData.tags || [];
            description = urlData.description;
        }

        const domain = this.extractDomain(url);
        const platformTag = this.getPlatformTag(domain);

        // Use provided title or auto-generate
        const title = providedTitle || await this.fetchTitle(url);

        // Combine provided tags and batch tags
        const allTags = [...new Set([...providedTags, ...batchTags])];

        const linkObject = {
            url,
            title,
            domain,
            platformTag,
            tags: allTags.length > 0 ? allTags : []
        };

        // Add description if provided
        if (description) {
            linkObject.description = description;
        }

        return linkObject;
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
