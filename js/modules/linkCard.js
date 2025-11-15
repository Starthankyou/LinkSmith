/**
 * Link Card Module
 * Handles rendering of link cards and list views
 */

export class LinkCardRenderer {
    constructor(storageManager) {
        this.storage = storageManager;
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentLinks = [];
        this.onLinkAction = null; // Callback for link actions
    }

    /**
     * Set callback for link actions
     */
    setActionCallback(callback) {
        this.onLinkAction = callback;
    }

    /**
     * Render link cards with pagination
     */
    renderLinks(links, containerId = 'links-container', sortBy = 'newest') {
        this.currentLinks = this.sortLinks(links, sortBy);
        const container = document.getElementById(containerId);

        if (!container) return;

        if (this.currentLinks.length === 0) {
            container.innerHTML = this.renderEmptyState();
            this.updatePaginationControls(0);
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(this.currentLinks.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageLinks = this.currentLinks.slice(startIndex, endIndex);

        // Render cards
        container.innerHTML = pageLinks.map(link => this.renderLinkCard(link)).join('');

        // Update pagination controls
        this.updatePaginationControls(totalPages);

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Sort links
     */
    sortLinks(links, sortBy) {
        const sorted = [...links];

        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
            case 'oldest':
                return sorted.sort((a, b) =>
                    new Date(a.createdAt) - new Date(b.createdAt)
                );
            case 'unread-first':
                return sorted.sort((a, b) => {
                    if (a.status === 'unread' && b.status !== 'unread') return -1;
                    if (a.status !== 'unread' && b.status === 'unread') return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
            default:
                return sorted;
        }
    }

    /**
     * Render a single link card
     */
    renderLinkCard(link) {
        const statusClass = link.status || 'unread';
        const frozenClass = link.frozen ? 'frozen' : '';
        const readClass = link.status === 'read' ? 'read' : '';

        return `
            <div class="link-card ${readClass} ${frozenClass}" data-link-id="${link.id}">
                <div class="link-header">
                    <div class="link-title">
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" data-link-id="${link.id}" class="link-open">
                            ${this.escapeHtml(link.title)}
                        </a>
                    </div>
                    <span class="status-badge ${statusClass}">${statusClass}</span>
                </div>

                <div class="link-meta">
                    <span class="link-domain">🌐 ${this.escapeHtml(link.domain)}</span>
                    <span class="link-date">📅 ${this.formatDate(link.createdAt)}</span>
                </div>

                ${this.renderTags(link)}

                <div class="link-actions">
                    ${link.status === 'read'
                        ? `<button class="btn btn-sm btn-secondary mark-unread" data-link-id="${link.id}">Mark Unread</button>`
                        : `<button class="btn btn-sm btn-success mark-read" data-link-id="${link.id}">Mark Read</button>`
                    }
                    <button class="btn btn-sm btn-secondary skip-link" data-link-id="${link.id}">Skip</button>
                    ${link.frozen
                        ? `<button class="btn btn-sm btn-secondary unfreeze-link" data-link-id="${link.id}">Unfreeze</button>`
                        : `<button class="btn btn-sm btn-warning freeze-link" data-link-id="${link.id}">Freeze 30d</button>`
                    }
                </div>
            </div>
        `;
    }

    /**
     * Render tags
     */
    renderTags(link) {
        const allTags = [];

        // Platform tag
        if (link.platformTag) {
            allTags.push(`<span class="link-tag platform-tag">${this.escapeHtml(link.platformTag)}</span>`);
        }

        // Custom tags
        if (link.tags && link.tags.length > 0) {
            link.tags.forEach(tag => {
                allTags.push(`<span class="link-tag">${this.escapeHtml(tag)}</span>`);
            });
        }

        if (allTags.length === 0) return '';

        return `<div class="link-tags">${allTags.join('')}</div>`;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No links found</h3>
                <p>Try adjusting your filters or import some links to get started.</p>
            </div>
        `;
    }

    /**
     * Update pagination controls
     */
    updatePaginationControls(totalPages) {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');

        if (!prevBtn || !nextBtn || !pageInfo) return;

        if (totalPages === 0) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            pageInfo.textContent = 'Page 0 of 0';
            return;
        }

        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= totalPages;
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
    }

    /**
     * Go to next page
     */
    nextPage() {
        const totalPages = Math.ceil(this.currentLinks.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderLinks(this.currentLinks);
        }
    }

    /**
     * Go to previous page
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderLinks(this.currentLinks);
        }
    }

    /**
     * Reset to page 1
     */
    resetPage() {
        this.currentPage = 1;
    }

    /**
     * Attach event listeners to action buttons
     */
    attachEventListeners() {
        // Open link
        document.querySelectorAll('.link-open').forEach(link => {
            link.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.handleLinkOpen(linkId);
            });
        });

        // Mark as read
        document.querySelectorAll('.mark-read').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.handleMarkRead(linkId);
            });
        });

        // Mark as unread
        document.querySelectorAll('.mark-unread').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.handleMarkUnread(linkId);
            });
        });

        // Skip
        document.querySelectorAll('.skip-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.handleSkip(linkId);
            });
        });

        // Freeze
        document.querySelectorAll('.freeze-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.handleFreeze(linkId);
            });
        });

        // Unfreeze
        document.querySelectorAll('.unfreeze-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.handleUnfreeze(linkId);
            });
        });
    }

    /**
     * Handle link open
     */
    handleLinkOpen(linkId) {
        this.storage.markAsRead(linkId);
        if (this.onLinkAction) {
            this.onLinkAction('open', linkId);
        }
    }

    /**
     * Handle mark as read
     */
    handleMarkRead(linkId) {
        this.storage.markAsRead(linkId);
        if (this.onLinkAction) {
            this.onLinkAction('read', linkId);
        }
    }

    /**
     * Handle mark as unread
     */
    handleMarkUnread(linkId) {
        this.storage.markAsUnread(linkId);
        if (this.onLinkAction) {
            this.onLinkAction('unread', linkId);
        }
    }

    /**
     * Handle skip
     */
    handleSkip(linkId) {
        this.storage.skipLink(linkId);
        if (this.onLinkAction) {
            this.onLinkAction('skip', linkId);
        }
    }

    /**
     * Handle freeze
     */
    handleFreeze(linkId) {
        this.storage.freezeLink(linkId);
        if (this.onLinkAction) {
            this.onLinkAction('freeze', linkId);
        }
    }

    /**
     * Handle unfreeze
     */
    handleUnfreeze(linkId) {
        this.storage.unfreezeLink(linkId);
        if (this.onLinkAction) {
            this.onLinkAction('unfreeze', linkId);
        }
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

        return date.toLocaleDateString();
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
