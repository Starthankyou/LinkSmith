/**
 * Tags Management Module
 * Handles the Tags management page UI and interactions
 */

export class TagsManagement {
    constructor(tagLibrary, tagSelector, storageManager) {
        this.tagLibrary = tagLibrary;
        this.tagSelector = tagSelector;
        this.storage = storageManager;
    }

    /**
     * Initialize tags management page
     */
    init() {
        this.renderStatistics();
        this.renderDeletedLinks();
        this.renderShortcuts();
        this.renderCategories();
        this.attachEventListeners();
    }

    /**
     * Render tag usage statistics
     */
    renderStatistics() {
        const container = document.getElementById('tag-statistics');
        if (!container) return;

        const stats = this.tagSelector.getTagStatistics();

        if (stats.total === 0) {
            container.innerHTML = '<p class="empty-state">尚無標籤使用記錄</p>';
            return;
        }

        let html = '<div class="stats-top-tags">';
        html += '<h4>最常使用標籤 TOP 10</h4>';

        stats.mostUsed.forEach((item, index) => {
            const percentage = (item.count / stats.mostUsed[0].count) * 100;
            html += `
                <div class="tag-stat-item">
                    <div class="tag-stat-rank">${index + 1}.</div>
                    <div class="tag-stat-name">${this.escapeHtml(item.tag)}</div>
                    <div class="tag-stat-bar">
                        <div class="tag-stat-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="tag-stat-count">${item.count}</div>
                </div>
            `;
        });

        html += '</div>';

        // Unused tags
        const allTags = this.tagLibrary.getAllTags();
        const usedTags = Object.keys(stats.counts);
        const unusedTags = allTags.filter(tag => !usedTags.includes(tag));

        if (unusedTags.length > 0) {
            html += '<div class="stats-unused-tags">';
            html += `<h4>未使用標籤 (${unusedTags.length})</h4>`;
            html += '<p style="color: var(--text-muted); font-size: 0.875rem;">';
            html += unusedTags.slice(0, 20).join(', ');
            if (unusedTags.length > 20) {
                html += ` ... 及其他 ${unusedTags.length - 20} 個`;
            }
            html += '</p>';
            html += '</div>';
        }

        container.innerHTML = html;
    }

    /**
     * Render deleted links list
     */
    renderDeletedLinks() {
        const container = document.getElementById('deleted-links-list');
        if (!container) return;

        const deletedLinks = this.storage.getDeletedLinks();

        if (deletedLinks.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">無已刪除連結</p>';
            return;
        }

        let html = `<p style="margin-bottom: 1rem; color: var(--text-secondary);">共 ${deletedLinks.length} 個已刪除連結</p>`;

        deletedLinks.forEach(link => {
            const deletedDate = link.deletedAt ? new Date(link.deletedAt).toLocaleDateString() : '未知';
            html += `
                <div class="deleted-link-item">
                    <div class="deleted-link-info">
                        <div class="deleted-link-title">${this.escapeHtml(link.title)}</div>
                        <div class="deleted-link-meta">
                            <span>🌐 ${this.escapeHtml(link.domain)}</span>
                            <span>|</span>
                            <span>刪除於 ${deletedDate}</span>
                        </div>
                    </div>
                    <div class="deleted-link-actions">
                        <button class="btn btn-sm btn-success restore-link" data-link-id="${link.id}">還原</button>
                        <button class="btn btn-sm btn-danger permanently-delete" data-link-id="${link.id}">永久刪除</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Attach event listeners
        container.querySelectorAll('.restore-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.restoreLink(linkId);
            });
        });

        container.querySelectorAll('.permanently-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const linkId = e.target.dataset.linkId;
                this.permanentlyDeleteLink(linkId);
            });
        });
    }

    /**
     * Render shortcuts list
     */
    renderShortcuts() {
        const container = document.getElementById('shortcuts-list');
        if (!container) return;

        const shortcuts = this.tagLibrary.getAllShortcuts();

        if (Object.keys(shortcuts).length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">尚無快捷組合</p>';
            return;
        }

        let html = '';

        Object.entries(shortcuts).forEach(([id, shortcut]) => {
            html += `
                <div class="shortcut-item" data-shortcut-id="${id}">
                    <div class="shortcut-info">
                        <div class="shortcut-name">${this.escapeHtml(shortcut.name)}</div>
                        <div class="shortcut-tags">→ ${shortcut.tags.join(', ')}</div>
                    </div>
                    <div class="shortcut-actions">
                        <button class="btn btn-sm btn-secondary edit-shortcut" data-shortcut-id="${id}">編輯</button>
                        <button class="btn btn-sm btn-danger delete-shortcut" data-shortcut-id="${id}">刪除</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Attach event listeners
        container.querySelectorAll('.delete-shortcut').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.shortcutId;
                this.deleteShortcut(id);
            });
        });
    }

    /**
     * Render categories list
     */
    renderCategories() {
        const container = document.getElementById('categories-list');
        if (!container) return;

        const categories = this.tagLibrary.getAllCategories();

        if (Object.keys(categories).length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">尚無標籤分類</p>';
            return;
        }

        let html = '';

        Object.entries(categories).forEach(([slug, category]) => {
            html += `
                <div class="category-item" data-category-slug="${slug}">
                    <div class="category-header">
                        <div class="category-title">${this.escapeHtml(category.name)} (${slug})</div>
                        <div class="category-actions">
                            <button class="btn btn-sm btn-secondary add-tag-to-category" data-slug="${slug}">+ 標籤</button>
                            <button class="btn btn-sm btn-danger delete-category" data-slug="${slug}">刪除分類</button>
                        </div>
                    </div>
                    <div class="category-tags">
            `;

            if (category.tags.length === 0) {
                html += '<span style="color: var(--text-muted); font-size: 0.875rem;">此分類尚無標籤</span>';
            } else {
                category.tags.forEach(tag => {
                    html += `
                        <span class="category-tag">
                            ${this.escapeHtml(tag)}
                            <span class="remove-tag" data-slug="${slug}" data-tag="${tag}">&times;</span>
                        </span>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Attach event listeners
        container.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.target.dataset.slug;
                this.deleteCategory(slug);
            });
        });

        container.querySelectorAll('.add-tag-to-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.target.dataset.slug;
                this.addTagToCategory(slug);
            });
        });

        container.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.target.dataset.slug;
                const tag = e.target.dataset.tag;
                this.removeTagFromCategory(slug, tag);
            });
        });
    }

    /**
     * Attach main event listeners
     */
    attachEventListeners() {
        // Add shortcut button
        const addShortcutBtn = document.getElementById('add-shortcut-btn');
        if (addShortcutBtn) {
            addShortcutBtn.addEventListener('click', () => {
                this.addShortcut();
            });
        }

        // Add category button
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.addCategory();
            });
        }

        // Reset library
        const resetBtn = document.getElementById('reset-library-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetLibrary();
            });
        }

        // Export library
        const exportBtn = document.getElementById('export-library-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLibrary();
            });
        }

        // Import library
        const importBtn = document.getElementById('import-library-btn');
        const importFile = document.getElementById('import-library-file');

        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });

            importFile.addEventListener('change', (e) => {
                this.importLibrary(e.target.files[0]);
            });
        }
    }

    /**
     * Add new shortcut
     */
    addShortcut() {
        const name = prompt('快捷組合名稱（例如：🚀 前端學習）：');
        if (!name) return;

        const tagsInput = prompt('標籤（用逗號分隔）：');
        if (!tagsInput) return;

        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

        this.tagLibrary.addShortcut(id, name, tags);
        this.renderShortcuts();
    }

    /**
     * Delete shortcut
     */
    deleteShortcut(id) {
        if (confirm('確定要刪除此快捷組合嗎？')) {
            this.tagLibrary.deleteShortcut(id);
            this.renderShortcuts();
        }
    }

    /**
     * Add new category
     */
    addCategory() {
        const slug = prompt('分類 Slug（英文，例如：my-category）：');
        if (!slug) return;

        const name = prompt('分類名稱（中文）：');
        if (!name) return;

        this.tagLibrary.addCategory(slug, name, []);
        this.renderCategories();
    }

    /**
     * Delete category
     */
    deleteCategory(slug) {
        if (confirm('確定要刪除此分類嗎？')) {
            this.tagLibrary.deleteCategory(slug);
            this.renderCategories();
        }
    }

    /**
     * Add tag to category
     */
    addTagToCategory(slug) {
        const tag = prompt('新增標籤：');
        if (!tag) return;

        this.tagLibrary.addTagToCategory(slug, tag.trim());
        this.renderCategories();
    }

    /**
     * Remove tag from category
     */
    removeTagFromCategory(slug, tag) {
        this.tagLibrary.removeTagFromCategory(slug, tag);
        this.renderCategories();
    }

    /**
     * Reset library to defaults
     */
    resetLibrary() {
        if (confirm('確定要重置為預設標籤庫嗎？所有自訂內容將會遺失。')) {
            this.tagLibrary.resetToDefaults();
            this.renderStatistics();
            this.renderShortcuts();
            this.renderCategories();
            alert('已重置為預設標籤庫');
        }
    }

    /**
     * Export library
     */
    exportLibrary() {
        const data = this.tagLibrary.exportLibrary();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `linksmith-tags-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Import library
     */
    async importLibrary(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            this.tagLibrary.importLibrary(data);
            this.renderStatistics();
            this.renderShortcuts();
            this.renderCategories();

            alert('匯入成功！');
        } catch (error) {
            alert('匯入失敗：' + error.message);
        }
    }

    /**
     * Restore deleted link
     */
    restoreLink(linkId) {
        if (confirm('確定要還原此連結嗎？')) {
            this.storage.restoreLink(linkId);
            this.renderDeletedLinks();
            this.renderStatistics();
            alert('連結已還原！');
        }
    }

    /**
     * Permanently delete link
     */
    permanentlyDeleteLink(linkId) {
        if (confirm('確定要永久刪除此連結嗎？此操作無法復原！')) {
            this.storage.permanentlyDeleteLink(linkId);
            this.renderDeletedLinks();
            this.renderStatistics();
            alert('連結已永久刪除！');
        }
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
