/**
 * LinkSmith - Main Application Controller
 */

import { StorageManager } from './modules/storage.js';
import { ImportManager } from './modules/import.js';
import { LinkCardRenderer } from './modules/linkCard.js';
import { SearchManager } from './modules/search.js';
import { RandomPicker } from './modules/randomPicker.js';

class LinkSmithApp {
    constructor() {
        this.storage = new StorageManager();
        this.importer = new ImportManager(this.storage);
        this.renderer = new LinkCardRenderer(this.storage);
        this.search = new SearchManager(this.storage);
        this.randomPicker = new RandomPicker(this.storage, this.search);

        this.currentView = 'dashboard';
        this.currentSort = 'newest';
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🔗 LinkSmith initializing...');

        // Load data
        await this.storage.init();

        // Set up event callbacks
        this.setupCallbacks();

        // Initialize UI components
        this.initNavigation();
        this.initDashboard();
        this.initImport();
        this.initRandomPicker();

        // Render initial view
        this.renderDashboard();

        console.log('✅ LinkSmith ready!');
    }

    /**
     * Set up callbacks between modules
     */
    setupCallbacks() {
        // When filters change, re-render dashboard
        this.search.setFilterChangeCallback(() => {
            this.renderDashboard();
        });

        // When link action occurs, re-render dashboard
        this.renderer.setActionCallback((action, linkId) => {
            this.renderDashboard();
        });
    }

    /**
     * Initialize navigation
     */
    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');

        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
    }

    /**
     * Switch between views
     */
    switchView(viewName) {
        // Update current view
        this.currentView = viewName;

        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const selectedView = document.getElementById(`${viewName}-view`);
        if (selectedView) {
            selectedView.classList.add('active');
        }

        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewName) {
                btn.classList.add('active');
            }
        });

        // Perform view-specific actions
        if (viewName === 'dashboard') {
            this.renderDashboard();
        } else if (viewName === 'random') {
            // Clear random result when entering view
            const randomResult = document.getElementById('random-result');
            if (randomResult) {
                randomResult.innerHTML = '';
            }
        }
    }

    /**
     * Initialize dashboard
     */
    initDashboard() {
        // Initialize search UI
        this.search.initSearchUI();

        // Sort control
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderDashboard();
            });
        }

        // Pagination controls
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.renderer.prevPage();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.renderer.nextPage();
            });
        }
    }

    /**
     * Render dashboard
     */
    renderDashboard() {
        // Get filtered links
        const filteredLinks = this.search.getFilteredLinks();

        // Render links
        this.renderer.resetPage(); // Reset to page 1 when filters change
        this.renderer.renderLinks(filteredLinks, 'links-container', this.currentSort);

        // Update stats
        this.updateStats();

        // Render tag clouds
        const allTags = this.storage.getAllTags();
        const platformTags = this.storage.getAllPlatformTags();

        this.search.renderTagCloud('custom-tags', allTags, 'custom');
        this.search.renderTagCloud('platform-tags', platformTags, 'platform');
    }

    /**
     * Update statistics
     */
    updateStats() {
        const stats = this.storage.getStats();

        const totalCount = document.getElementById('total-count');
        const unreadCount = document.getElementById('unread-count');

        if (totalCount) {
            totalCount.textContent = stats.total;
        }

        if (unreadCount) {
            unreadCount.textContent = stats.unread;
        }
    }

    /**
     * Initialize import view
     */
    initImport() {
        const importBtn = document.getElementById('import-btn');
        const importTextarea = document.getElementById('import-textarea');
        const batchTagsInput = document.getElementById('batch-tags');
        const importResult = document.getElementById('import-result');

        if (importBtn) {
            importBtn.addEventListener('click', async () => {
                const urlsText = importTextarea.value.trim();
                const batchTags = batchTagsInput.value.trim();

                if (!urlsText) {
                    this.showImportResult('Please enter at least one URL', 'error');
                    return;
                }

                // Disable button during import
                importBtn.disabled = true;
                importBtn.textContent = 'Importing...';

                try {
                    const result = await this.importer.importUrls(urlsText, batchTags);

                    this.showImportResult(
                        `✅ Successfully imported ${result.count} link(s)!`,
                        'success'
                    );

                    // Clear inputs
                    importTextarea.value = '';
                    batchTagsInput.value = '';

                    // Update dashboard
                    this.renderDashboard();

                } catch (error) {
                    this.showImportResult(
                        `❌ Import failed: ${error.message}`,
                        'error'
                    );
                } finally {
                    // Re-enable button
                    importBtn.disabled = false;
                    importBtn.textContent = 'Import Links';
                }
            });
        }
    }

    /**
     * Show import result message
     */
    showImportResult(message, type = 'success') {
        const importResult = document.getElementById('import-result');
        if (!importResult) return;

        importResult.className = `import-result ${type}`;
        importResult.textContent = message;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            importResult.className = 'import-result';
            importResult.textContent = '';
        }, 5000);
    }

    /**
     * Initialize random picker
     */
    initRandomPicker() {
        this.randomPicker.initUI();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new LinkSmithApp();
    app.init();

    // Expose app to window for debugging
    window.linkSmithApp = app;
});
