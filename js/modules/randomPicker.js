/**
 * Random Picker Module
 * Handles random link selection and display
 */

export class RandomPicker {
    constructor(storageManager, searchManager) {
        this.storage = storageManager;
        this.search = searchManager;
        this.currentRandomLink = null;
    }

    /**
     * Pick a random link based on current filters
     */
    pickRandom() {
        const filters = this.search.getFilters();
        const randomLink = this.storage.getRandomLink(filters);

        if (randomLink) {
            this.currentRandomLink = randomLink;
            return randomLink;
        }

        return null;
    }

    /**
     * Render random result
     */
    renderRandomResult(containerId = 'random-result') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const link = this.pickRandom();

        if (!link) {
            container.innerHTML = this.renderNoResultState();
            return;
        }

        container.innerHTML = this.renderRandomCard(link);
        this.attachEventListeners();
    }

    /**
     * Render random card
     */
    renderRandomCard(link) {
        return `
            <div class="random-card">
                <div class="link-title">
                    ${this.escapeHtml(link.title)}
                </div>

                <div class="link-url">
                    <strong>🔗 URL:</strong> ${this.escapeHtml(link.url)}
                </div>

                <div class="link-meta">
                    <span class="link-domain">🌐 ${this.escapeHtml(link.domain)}</span>
                    ${link.platformTag ? `<span class="link-tag platform-tag">${this.escapeHtml(link.platformTag)}</span>` : ''}
                </div>

                ${this.renderTags(link)}

                <div class="link-actions">
                    <button class="btn btn-primary random-open" data-link-id="${link.id}" data-url="${this.escapeHtml(link.url)}">
                        🚀 Open Link
                    </button>
                    <button class="btn btn-secondary random-skip" data-link-id="${link.id}">
                        ⏭️ Skip
                    </button>
                    <button class="btn btn-warning random-freeze" data-link-id="${link.id}">
                        ❄️ Freeze 30d
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render tags
     */
    renderTags(link) {
        if (!link.tags || link.tags.length === 0) return '';

        const tagElements = link.tags.map(tag =>
            `<span class="link-tag">${this.escapeHtml(tag)}</span>`
        ).join('');

        return `<div class="link-tags">${tagElements}</div>`;
    }

    /**
     * Render no result state
     */
    renderNoResultState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">🎲</div>
                <h3>No links available</h3>
                <p>All links in your current filter have been read, frozen, or skipped.</p>
                <p>Try clearing your filters or importing more links.</p>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Open button
        const openBtn = document.querySelector('.random-open');
        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                const url = e.target.dataset.url;
                this.handleOpen(linkId, url);
            });
        }

        // Skip button
        const skipBtn = document.querySelector('.random-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.handleSkip(linkId);
            });
        }

        // Freeze button
        const freezeBtn = document.querySelector('.random-freeze');
        if (freezeBtn) {
            freezeBtn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.handleFreeze(linkId);
            });
        }
    }

    /**
     * Handle open
     */
    handleOpen(linkId, url) {
        // Mark as read
        this.storage.markAsRead(linkId);

        // Open in new tab
        window.open(url, '_blank', 'noopener,noreferrer');

        // Show success message and pick another
        this.showMessage('Link opened and marked as read! Pick another?');

        // Auto pick another after a short delay
        setTimeout(() => {
            this.renderRandomResult();
        }, 1500);
    }

    /**
     * Handle skip
     */
    handleSkip(linkId) {
        this.storage.skipLink(linkId);
        this.showMessage('Link skipped! Picking another...');

        // Pick another immediately
        setTimeout(() => {
            this.renderRandomResult();
        }, 800);
    }

    /**
     * Handle freeze
     */
    handleFreeze(linkId) {
        this.storage.freezeLink(linkId);
        this.showMessage('Link frozen for 30 days! Picking another...');

        // Pick another immediately
        setTimeout(() => {
            this.renderRandomResult();
        }, 800);
    }

    /**
     * Show temporary message
     */
    showMessage(text) {
        const container = document.getElementById('random-result');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'import-result success';
        messageDiv.textContent = text;
        messageDiv.style.marginBottom = '1rem';

        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    /**
     * Initialize random picker UI
     */
    initUI() {
        const pickBtn = document.getElementById('random-pick-btn');
        if (pickBtn) {
            pickBtn.addEventListener('click', () => {
                this.renderRandomResult();
            });
        }
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
