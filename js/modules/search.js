/**
 * Search and Tags Module
 * Handles search, filtering, and tag management
 */

export class SearchManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.currentFilters = {
            search: '',
            statuses: ['all'],
            tags: [],
            platformTags: []
        };
        this.onFilterChange = null; // Callback when filters change
    }

    /**
     * Set callback for filter changes
     */
    setFilterChangeCallback(callback) {
        this.onFilterChange = callback;
    }

    /**
     * Update search query
     */
    setSearch(query) {
        this.currentFilters.search = query;
        this.triggerFilterChange();
    }

    /**
     * Update status filter
     */
    setStatusFilter(statuses) {
        this.currentFilters.statuses = statuses;
        this.triggerFilterChange();
    }

    /**
     * Toggle tag filter
     */
    toggleTag(tag) {
        const index = this.currentFilters.tags.indexOf(tag);
        if (index > -1) {
            this.currentFilters.tags.splice(index, 1);
        } else {
            this.currentFilters.tags.push(tag);
        }
        this.triggerFilterChange();
    }

    /**
     * Toggle platform tag filter
     */
    togglePlatformTag(platformTag) {
        const index = this.currentFilters.platformTags.indexOf(platformTag);
        if (index > -1) {
            this.currentFilters.platformTags.splice(index, 1);
        } else {
            this.currentFilters.platformTags.push(platformTag);
        }
        this.triggerFilterChange();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {
            search: '',
            statuses: ['all'],
            tags: [],
            platformTags: []
        };
        this.triggerFilterChange();
    }

    /**
     * Get current filters
     */
    getFilters() {
        return { ...this.currentFilters };
    }

    /**
     * Get filtered links
     */
    getFilteredLinks() {
        return this.storage.getFilteredLinks(this.currentFilters);
    }

    /**
     * Trigger filter change callback
     */
    triggerFilterChange() {
        if (this.onFilterChange) {
            this.onFilterChange(this.getFilters());
        }
    }

    /**
     * Render tag cloud
     */
    renderTagCloud(containerId, tags, type = 'custom') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (tags.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">No tags</p>';
            return;
        }

        // Count occurrences
        const tagCounts = this.getTagCounts(tags);

        const tagElements = tags.map(tag => {
            const count = tagCounts[tag] || 0;
            const isActive = type === 'custom'
                ? this.currentFilters.tags.includes(tag)
                : this.currentFilters.platformTags.includes(tag);

            return `
                <span class="tag ${isActive ? 'active' : ''}" data-tag="${this.escapeHtml(tag)}" data-type="${type}">
                    ${this.escapeHtml(tag)}
                    <span class="count">(${count})</span>
                </span>
            `;
        }).join('');

        container.innerHTML = tagElements;

        // Attach click handlers
        container.querySelectorAll('.tag').forEach(tagEl => {
            tagEl.addEventListener('click', (e) => {
                const tag = e.currentTarget.dataset.tag;
                const type = e.currentTarget.dataset.type;

                if (type === 'custom') {
                    this.toggleTag(tag);
                } else {
                    this.togglePlatformTag(tag);
                }

                // Update visual state
                e.currentTarget.classList.toggle('active');
            });
        });
    }

    /**
     * Get tag counts
     */
    getTagCounts(tags) {
        const allLinks = this.storage.getAllLinks();
        const counts = {};

        tags.forEach(tag => {
            counts[tag] = allLinks.filter(link => {
                if (link.platformTag === tag) return true;
                if (link.tags && link.tags.includes(tag)) return true;
                return false;
            }).length;
        });

        return counts;
    }

    /**
     * Initialize search UI
     */
    initSearchUI() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.setSearch(e.target.value);
            });
        }

        // Status filter checkboxes
        const statusCheckboxes = document.querySelectorAll('input[name="status-filter"]');
        statusCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateStatusFilter();
            });
        });

        // Clear filters button
        const clearBtn = document.getElementById('clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFiltersUI();
            });
        }
    }

    /**
     * Update status filter from checkboxes
     */
    updateStatusFilter() {
        const checkboxes = document.querySelectorAll('input[name="status-filter"]:checked');
        const statuses = Array.from(checkboxes).map(cb => cb.value);
        this.setStatusFilter(statuses.length > 0 ? statuses : ['all']);
    }

    /**
     * Clear all filters and update UI
     */
    clearAllFiltersUI() {
        // Clear search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        // Reset status checkboxes
        const statusCheckboxes = document.querySelectorAll('input[name="status-filter"]');
        statusCheckboxes.forEach(cb => {
            cb.checked = cb.value === 'all';
        });

        // Clear active tags
        document.querySelectorAll('.tag.active').forEach(tag => {
            tag.classList.remove('active');
        });

        // Clear filters
        this.clearFilters();
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
