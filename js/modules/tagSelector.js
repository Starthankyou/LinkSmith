/**
 * Tag Selector Component
 * Renders tag selection UI with categories and shortcuts
 */

export class TagSelector {
    constructor(tagLibrary, storageManager) {
        this.tagLibrary = tagLibrary;
        this.storage = storageManager;
        this.selectedTags = new Set();
        this.onSelectionChange = null;
    }

    /**
     * Set callback for selection changes
     */
    setSelectionChangeCallback(callback) {
        this.onSelectionChange = callback;
    }

    /**
     * Get selected tags
     */
    getSelectedTags() {
        return Array.from(this.selectedTags);
    }

    /**
     * Set selected tags
     */
    setSelectedTags(tags) {
        this.selectedTags = new Set(tags);
        this.triggerSelectionChange();
    }

    /**
     * Clear selected tags
     */
    clearSelection() {
        this.selectedTags.clear();
        this.triggerSelectionChange();
    }

    /**
     * Toggle tag selection
     */
    toggleTag(tag) {
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
        } else {
            this.selectedTags.add(tag);
        }
        this.triggerSelectionChange();
    }

    /**
     * Apply shortcut (add all tags from shortcut)
     */
    applyShortcut(shortcutId) {
        const shortcuts = this.tagLibrary.getAllShortcuts();
        const shortcut = shortcuts[shortcutId];

        if (shortcut && shortcut.tags) {
            shortcut.tags.forEach(tag => this.selectedTags.add(tag));
            this.triggerSelectionChange();
        }
    }

    /**
     * Trigger selection change callback
     */
    triggerSelectionChange() {
        if (this.onSelectionChange) {
            this.onSelectionChange(this.getSelectedTags());
        }
    }

    /**
     * Render batch tag selector (with shortcuts and categories)
     */
    renderBatchSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const shortcuts = this.tagLibrary.getAllShortcuts();
        const categories = this.tagLibrary.getAllCategories();

        let html = '<div class="tag-selector">';

        // Shortcuts section
        if (Object.keys(shortcuts).length > 0) {
            html += '<div class="tag-shortcuts">';
            html += '<h4>快捷組合</h4>';
            html += '<div class="shortcut-buttons">';

            Object.entries(shortcuts).forEach(([id, shortcut]) => {
                html += `
                    <button class="btn btn-sm btn-secondary shortcut-btn" data-shortcut-id="${id}">
                        ${this.escapeHtml(shortcut.name)}
                    </button>
                `;
            });

            html += '</div>';
            html += '</div>';
        }

        // Categories section - simplified to show only category names
        html += '<div class="tag-categories-simple">';
        html += '<h4>大分類</h4>';
        html += '<div class="tag-list">';

        Object.entries(categories).forEach(([slug, category]) => {
            const isSelected = this.selectedTags.has(slug);
            html += `
                <label class="tag-checkbox ${isSelected ? 'selected' : ''}">
                    <input type="checkbox"
                           value="${this.escapeHtml(slug)}"
                           ${isSelected ? 'checked' : ''}>
                    <span>${this.escapeHtml(category.name)}</span>
                </label>
            `;
        });

        html += '</div>';
        html += '</div>';

        // Selected tags preview
        html += '<div class="selected-tags-preview">';
        html += '<strong>已選擇：</strong>';
        html += '<span id="selected-tags-display">';
        html += this.getSelectedTags().join(', ') || '無';
        html += '</span>';
        html += '<button id="clear-tag-selection" class="btn btn-sm btn-secondary">清除選擇</button>';
        html += '</div>';

        html += '</div>';

        container.innerHTML = html;

        // Attach event listeners
        this.attachBatchSelectorEvents(container);
    }

    /**
     * Attach event listeners to batch selector
     */
    attachBatchSelectorEvents(container) {
        // Tag checkboxes
        container.querySelectorAll('.tag-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const tag = e.target.value;
                this.toggleTag(tag);
                this.updateBatchSelectorUI(container);
            });
        });

        // Shortcut buttons
        container.querySelectorAll('.shortcut-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shortcutId = e.target.dataset.shortcutId;
                this.applyShortcut(shortcutId);
                this.updateBatchSelectorUI(container);
            });
        });

        // Clear button
        const clearBtn = container.querySelector('#clear-tag-selection');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearSelection();
                this.updateBatchSelectorUI(container);
            });
        }
    }

    /**
     * Update batch selector UI after changes
     */
    updateBatchSelectorUI(container) {
        // Update checkboxes
        container.querySelectorAll('.tag-checkbox').forEach(label => {
            const checkbox = label.querySelector('input');
            const tag = checkbox.value;
            const isSelected = this.selectedTags.has(tag);

            checkbox.checked = isSelected;
            if (isSelected) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });

        // Update preview
        const display = container.querySelector('#selected-tags-display');
        if (display) {
            const tags = this.getSelectedTags();
            display.textContent = tags.length > 0 ? tags.join(', ') : '無';
        }
    }

    /**
     * Render compact tag selector (for individual links)
     * Returns modal HTML that can be shown/hidden
     */
    renderCompactSelector() {
        const categories = this.tagLibrary.getAllCategories();

        let html = '<div class="tag-selector-modal">';
        html += '<div class="tag-selector-modal-content">';
        html += '<div class="tag-selector-modal-header">';
        html += '<h3>選擇標籤</h3>';
        html += '<button class="close-modal">&times;</button>';
        html += '</div>';

        html += '<div class="tag-selector-modal-body">';

        Object.entries(categories).forEach(([slug, category]) => {
            html += `
                <div class="tag-category-compact">
                    <h4>${this.escapeHtml(category.name)}</h4>
                    <div class="tag-list-compact">
            `;

            category.tags.forEach(tag => {
                const isSelected = this.selectedTags.has(tag);
                html += `
                    <label class="tag-checkbox-compact ${isSelected ? 'selected' : ''}">
                        <input type="checkbox"
                               value="${this.escapeHtml(tag)}"
                               ${isSelected ? 'checked' : ''}>
                        <span>${this.escapeHtml(tag)}</span>
                    </label>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += '</div>';

        html += '<div class="tag-selector-modal-footer">';
        html += '<span class="selected-count">已選擇 <strong>0</strong> 個標籤</span>';
        html += '<button class="btn btn-primary confirm-selection">確定</button>';
        html += '<button class="btn btn-secondary cancel-selection">取消</button>';
        html += '</div>';

        html += '</div>';
        html += '</div>';

        return html;
    }

    /**
     * Show compact selector modal
     */
    showCompactSelector(onConfirm, onCancel) {
        // Create modal if not exists
        let modal = document.querySelector('.tag-selector-modal');

        if (!modal) {
            const modalHTML = this.renderCompactSelector();
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.querySelector('.tag-selector-modal');
        }

        // Update UI with current selection
        this.updateCompactSelectorUI(modal);

        // Show modal
        modal.classList.add('active');

        // Attach event listeners
        this.attachCompactSelectorEvents(modal, onConfirm, onCancel);
    }

    /**
     * Attach events to compact selector
     */
    attachCompactSelectorEvents(modal, onConfirm, onCancel) {
        // Checkboxes
        modal.querySelectorAll('.tag-checkbox-compact input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const tag = e.target.value;
                this.toggleTag(tag);
                this.updateCompactSelectorUI(modal);
            });
        });

        // Confirm button
        const confirmBtn = modal.querySelector('.confirm-selection');
        confirmBtn.onclick = () => {
            if (onConfirm) {
                onConfirm(this.getSelectedTags());
            }
            modal.classList.remove('active');
        };

        // Cancel button
        const cancelBtn = modal.querySelector('.cancel-selection');
        cancelBtn.onclick = () => {
            if (onCancel) {
                onCancel();
            }
            modal.classList.remove('active');
        };

        // Close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => {
            modal.classList.remove('active');
        };

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    /**
     * Update compact selector UI
     */
    updateCompactSelectorUI(modal) {
        // Update checkboxes
        modal.querySelectorAll('.tag-checkbox-compact').forEach(label => {
            const checkbox = label.querySelector('input');
            const tag = checkbox.value;
            const isSelected = this.selectedTags.has(tag);

            checkbox.checked = isSelected;
            if (isSelected) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });

        // Update count
        const countSpan = modal.querySelector('.selected-count strong');
        if (countSpan) {
            countSpan.textContent = this.selectedTags.size;
        }
    }

    /**
     * Get tag usage statistics
     */
    getTagStatistics() {
        const allLinks = this.storage.getAllLinks();
        const tagCounts = {};

        allLinks.forEach(link => {
            if (link.tags && Array.isArray(link.tags)) {
                link.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        // Sort by count descending
        const sorted = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => ({ tag, count }));

        return {
            counts: tagCounts,
            sorted: sorted,
            total: Object.keys(tagCounts).length,
            mostUsed: sorted.slice(0, 10)
        };
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
