/**
 * Settings Manager
 * Handles GitHub Gist sync configuration and settings UI
 */

import { GistSync } from './gistSync.js';

export class SettingsManager {
    constructor(storageManager = null) {
        this.storage = storageManager;
        this.settings = {
            githubToken: '',
            gistId: '',
            autoSyncEnabled: false,
            syncInterval: 15 // minutes
        };

        this.lastSyncTime = null;
        this.syncIntervalId = null;
        this.gistSync = null;
    }

    /**
     * Set storage manager (called from main.js after storage is initialized)
     */
    setStorageManager(storageManager) {
        this.storage = storageManager;
    }

    /**
     * Get or create GistSync instance
     */
    getGistSync() {
        if (!this.gistSync || this.gistSync.settings !== this.settings) {
            this.gistSync = new GistSync(this.settings);
        }
        return this.gistSync;
    }

    /**
     * Initialize settings
     */
    async init() {
        console.log('⚙️ Initializing Settings...');

        // Load settings from localStorage
        this.loadSettings();

        // Initialize UI
        this.initUI();

        // Update sync status
        this.updateSyncStatus();
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem('linksmith_settings');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.settings = { ...this.settings, ...parsed };
            }

            const lastSync = localStorage.getItem('linksmith_last_sync');
            if (lastSync) {
                this.lastSyncTime = new Date(lastSync);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('linksmith_settings', JSON.stringify(this.settings));
            console.log('✅ Settings saved');
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }

    /**
     * Initialize UI elements and event listeners
     */
    initUI() {
        // Populate form fields
        const tokenInput = document.getElementById('github-token');
        const gistIdInput = document.getElementById('gist-id');
        const autoSyncCheckbox = document.getElementById('auto-sync-enabled');
        const syncIntervalSelect = document.getElementById('sync-interval');

        if (tokenInput) tokenInput.value = this.settings.githubToken;
        if (gistIdInput) gistIdInput.value = this.settings.gistId;
        if (autoSyncCheckbox) autoSyncCheckbox.checked = this.settings.autoSyncEnabled;
        if (syncIntervalSelect) syncIntervalSelect.value = this.settings.syncInterval.toString();

        // Token visibility toggle
        const toggleTokenBtn = document.getElementById('toggle-token-visibility');
        if (toggleTokenBtn && tokenInput) {
            toggleTokenBtn.addEventListener('click', () => {
                const isPassword = tokenInput.type === 'password';
                tokenInput.type = isPassword ? 'text' : 'password';
                toggleTokenBtn.textContent = isPassword ? '🙈' : '👁️';
            });
        }

        // Test connection button
        const testBtn = document.getElementById('test-connection-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testConnection());
        }

        // Save settings button
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSaveSettings());
        }

        // Manual sync buttons
        const syncNowBtn = document.getElementById('sync-now-btn');
        if (syncNowBtn) {
            syncNowBtn.addEventListener('click', () => this.syncNow());
        }

        const forceUploadBtn = document.getElementById('force-upload-btn');
        if (forceUploadBtn) {
            forceUploadBtn.addEventListener('click', () => this.forceUpload());
        }

        const forceDownloadBtn = document.getElementById('force-download-btn');
        if (forceDownloadBtn) {
            forceDownloadBtn.addEventListener('click', () => this.forceDownload());
        }

        // Danger zone buttons
        const clearSettingsBtn = document.getElementById('clear-settings-btn');
        if (clearSettingsBtn) {
            clearSettingsBtn.addEventListener('click', () => this.clearSettings());
        }

        const deleteGistBtn = document.getElementById('delete-gist-btn');
        if (deleteGistBtn) {
            deleteGistBtn.addEventListener('click', () => this.deleteGist());
        }

        // Enable/disable sync buttons based on configuration
        this.updateSyncButtonStates();
    }

    /**
     * Update sync status indicator
     */
    updateSyncStatus() {
        const statusElement = document.getElementById('sync-status');
        if (!statusElement) return;

        const indicator = statusElement.querySelector('.status-indicator');
        const lastSyncElement = document.getElementById('last-sync-time');

        const isConfigured = this.settings.githubToken && this.settings.gistId;

        if (indicator) {
            if (isConfigured) {
                indicator.className = 'status-indicator status-configured';
                indicator.textContent = 'Configured and ready';
            } else {
                indicator.className = 'status-indicator status-unconfigured';
                indicator.textContent = 'Not configured';
            }
        }

        if (lastSyncElement) {
            if (this.lastSyncTime) {
                const timeAgo = this.getTimeAgo(this.lastSyncTime);
                lastSyncElement.textContent = `Last synced: ${timeAgo}`;
            } else {
                lastSyncElement.textContent = '';
            }
        }
    }

    /**
     * Get human-readable time ago
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    /**
     * Update sync button states
     */
    updateSyncButtonStates() {
        const isConfigured = this.settings.githubToken && this.settings.gistId;

        const syncNowBtn = document.getElementById('sync-now-btn');
        const forceUploadBtn = document.getElementById('force-upload-btn');
        const forceDownloadBtn = document.getElementById('force-download-btn');
        const deleteGistBtn = document.getElementById('delete-gist-btn');

        if (syncNowBtn) syncNowBtn.disabled = !isConfigured;
        if (forceUploadBtn) forceUploadBtn.disabled = !isConfigured;
        if (forceDownloadBtn) forceDownloadBtn.disabled = !isConfigured;
        if (deleteGistBtn) deleteGistBtn.disabled = !isConfigured;
    }

    /**
     * Test GitHub connection
     */
    async testConnection() {
        const tokenInput = document.getElementById('github-token');
        const token = tokenInput?.value.trim();

        if (!token) {
            this.showMessage('Please enter a GitHub token', 'error');
            return;
        }

        const testBtn = document.getElementById('test-connection-btn');
        if (testBtn) {
            testBtn.disabled = true;
            testBtn.textContent = 'Testing...';
        }

        try {
            // Test GitHub API connection
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const user = await response.json();
                this.showMessage(`✅ Connected successfully as ${user.login}`, 'success');
            } else if (response.status === 401) {
                this.showMessage('❌ Invalid token. Please check your GitHub token.', 'error');
            } else {
                this.showMessage(`❌ Connection failed: ${response.statusText}`, 'error');
            }
        } catch (error) {
            this.showMessage(`❌ Connection error: ${error.message}`, 'error');
        } finally {
            if (testBtn) {
                testBtn.disabled = false;
                testBtn.textContent = 'Test Connection';
            }
        }
    }

    /**
     * Handle save settings
     */
    async handleSaveSettings() {
        const tokenInput = document.getElementById('github-token');
        const gistIdInput = document.getElementById('gist-id');
        const autoSyncCheckbox = document.getElementById('auto-sync-enabled');
        const syncIntervalSelect = document.getElementById('sync-interval');

        const token = tokenInput?.value.trim();
        const gistId = gistIdInput?.value.trim();

        if (!token) {
            this.showMessage('Please enter a GitHub token', 'error');
            return;
        }

        // Update settings
        this.settings.githubToken = token;
        this.settings.gistId = gistId;
        this.settings.autoSyncEnabled = autoSyncCheckbox?.checked || false;
        this.settings.syncInterval = parseInt(syncIntervalSelect?.value || '15');

        try {
            this.saveSettings();
            this.showMessage('✅ Settings saved successfully!', 'success');
            this.updateSyncStatus();
            this.updateSyncButtonStates();

            // Setup auto-sync if enabled
            if (this.settings.autoSyncEnabled && this.settings.syncInterval > 0) {
                this.setupAutoSync();
            } else {
                this.stopAutoSync();
            }
        } catch (error) {
            this.showMessage(`❌ Failed to save settings: ${error.message}`, 'error');
        }
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        const messageElement = document.getElementById('settings-message');
        if (!messageElement) return;

        messageElement.className = `settings-message ${type}`;
        messageElement.textContent = message;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.className = 'settings-message';
            messageElement.textContent = '';
        }, 5000);
    }

    /**
     * Show sync result message
     */
    showSyncResult(message, type = 'info') {
        const resultElement = document.getElementById('sync-result');
        if (!resultElement) return;

        resultElement.className = `sync-result ${type}`;
        resultElement.textContent = message;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            resultElement.className = 'sync-result';
            resultElement.textContent = '';
        }, 5000);
    }

    /**
     * Sync now (smart merge)
     */
    async syncNow() {
        if (!this.storage) {
            this.showSyncResult('❌ Storage not initialized', 'error');
            return;
        }

        if (!this.isConfigured() && !this.settings.githubToken) {
            this.showSyncResult('❌ Please configure GitHub token first', 'error');
            return;
        }

        const statusElement = document.querySelector('#sync-status .status-indicator');
        const syncNowBtn = document.getElementById('sync-now-btn');

        try {
            // Update status to syncing
            if (statusElement) {
                statusElement.className = 'status-indicator status-syncing';
                statusElement.textContent = 'Syncing...';
            }

            if (syncNowBtn) {
                syncNowBtn.disabled = true;
                syncNowBtn.innerHTML = '<span class="btn-icon">⏳</span> Syncing...';
            }

            // Get local links
            const localLinks = this.storage.links || [];

            // Sync with Gist
            const gistSync = this.getGistSync();
            const result = await gistSync.syncData(localLinks);

            // Update Gist ID if new one was created
            if (result.gistId && result.gistId !== this.settings.gistId) {
                this.settings.gistId = result.gistId;
                this.saveSettings();

                const gistIdInput = document.getElementById('gist-id');
                if (gistIdInput) {
                    gistIdInput.value = result.gistId;
                }
            }

            // Update local storage with merged data
            if (result.merged) {
                this.storage.links = result.merged;
                this.storage.saveAllLinks();
            }

            // Update last sync time
            this.lastSyncTime = new Date();
            localStorage.setItem('linksmith_last_sync', this.lastSyncTime.toISOString());

            // Show success message
            const stats = result.stats;
            const message = `✅ Sync completed! ⬆️ ${stats.uploaded} uploaded, ⬇️ ${stats.downloaded} downloaded${stats.conflicts > 0 ? `, ⚠️ ${stats.conflicts} conflicts resolved` : ''}`;
            this.showSyncResult(message, 'success');

            // Update status
            this.updateSyncStatus();
            this.updateSyncButtonStates();

            console.log('✅ Sync completed:', result);

        } catch (error) {
            console.error('❌ Sync failed:', error);
            this.showSyncResult(`❌ Sync failed: ${error.message}`, 'error');

            // Update status to error
            if (statusElement) {
                statusElement.className = 'status-indicator status-error';
                statusElement.textContent = 'Sync failed';
            }
        } finally {
            if (syncNowBtn) {
                syncNowBtn.disabled = false;
                syncNowBtn.innerHTML = '<span class="btn-icon">☁️</span> Sync Now';
            }
        }
    }

    /**
     * Force upload to Gist (overwrite remote with local)
     */
    async forceUpload() {
        if (!this.storage) {
            this.showSyncResult('❌ Storage not initialized', 'error');
            return;
        }

        if (!this.settings.githubToken) {
            this.showSyncResult('❌ Please configure GitHub token first', 'error');
            return;
        }

        if (!confirm('⚠️ This will overwrite all remote data with your local data. Continue?')) {
            return;
        }

        const forceUploadBtn = document.getElementById('force-upload-btn');

        try {
            if (forceUploadBtn) {
                forceUploadBtn.disabled = true;
                forceUploadBtn.innerHTML = '<span class="btn-icon">⏳</span> Uploading...';
            }

            // Get local links
            const localLinks = this.storage.links || [];

            // Force upload
            const gistSync = this.getGistSync();
            const result = await gistSync.forceUpload(localLinks);

            // Update Gist ID if new one was created
            if (result.gistId && result.gistId !== this.settings.gistId) {
                this.settings.gistId = result.gistId;
                this.saveSettings();

                const gistIdInput = document.getElementById('gist-id');
                if (gistIdInput) {
                    gistIdInput.value = result.gistId;
                }
            }

            // Update last sync time
            this.lastSyncTime = new Date();
            localStorage.setItem('linksmith_last_sync', this.lastSyncTime.toISOString());

            this.showSyncResult(`✅ Uploaded ${result.count} links to Gist`, 'success');
            this.updateSyncStatus();
            this.updateSyncButtonStates();

        } catch (error) {
            console.error('❌ Upload failed:', error);
            this.showSyncResult(`❌ Upload failed: ${error.message}`, 'error');
        } finally {
            if (forceUploadBtn) {
                forceUploadBtn.disabled = false;
                forceUploadBtn.innerHTML = '<span class="btn-icon">⬆️</span> Force Upload to Gist';
            }
        }
    }

    /**
     * Force download from Gist (overwrite local with remote)
     */
    async forceDownload() {
        if (!this.storage) {
            this.showSyncResult('❌ Storage not initialized', 'error');
            return;
        }

        if (!this.isConfigured()) {
            this.showSyncResult('❌ Please configure GitHub token and Gist ID first', 'error');
            return;
        }

        if (!confirm('⚠️ This will overwrite all local data with remote data. Continue?')) {
            return;
        }

        const forceDownloadBtn = document.getElementById('force-download-btn');

        try {
            if (forceDownloadBtn) {
                forceDownloadBtn.disabled = true;
                forceDownloadBtn.innerHTML = '<span class="btn-icon">⏳</span> Downloading...';
            }

            // Force download
            const gistSync = this.getGistSync();
            const result = await gistSync.forceDownload();

            // Update local storage
            this.storage.links = result.links;
            this.storage.saveAllLinks();

            // Update last sync time
            this.lastSyncTime = new Date();
            localStorage.setItem('linksmith_last_sync', this.lastSyncTime.toISOString());

            this.showSyncResult(`✅ Downloaded ${result.count} links from Gist`, 'success');
            this.updateSyncStatus();

            // Trigger dashboard refresh if in main app
            if (window.linkSmithApp && window.linkSmithApp.renderDashboard) {
                window.linkSmithApp.renderDashboard();
            }

        } catch (error) {
            console.error('❌ Download failed:', error);
            this.showSyncResult(`❌ Download failed: ${error.message}`, 'error');
        } finally {
            if (forceDownloadBtn) {
                forceDownloadBtn.disabled = false;
                forceDownloadBtn.innerHTML = '<span class="btn-icon">⬇️</span> Force Download from Gist';
            }
        }
    }

    /**
     * Setup auto-sync interval
     */
    setupAutoSync() {
        this.stopAutoSync();

        if (this.settings.syncInterval > 0) {
            const intervalMs = this.settings.syncInterval * 60 * 1000;
            this.syncIntervalId = setInterval(() => {
                this.syncNow();
            }, intervalMs);
            console.log(`🔄 Auto-sync enabled (every ${this.settings.syncInterval} minutes)`);
        }
    }

    /**
     * Stop auto-sync interval
     */
    stopAutoSync() {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = null;
            console.log('⏸️ Auto-sync stopped');
        }
    }

    /**
     * Clear all settings
     */
    clearSettings() {
        if (!confirm('Are you sure you want to clear all sync settings? This will not delete your local data or the remote Gist.')) {
            return;
        }

        this.settings = {
            githubToken: '',
            gistId: '',
            autoSyncEnabled: false,
            syncInterval: 15
        };

        this.lastSyncTime = null;
        this.stopAutoSync();

        try {
            localStorage.removeItem('linksmith_settings');
            localStorage.removeItem('linksmith_last_sync');

            // Reset UI
            const tokenInput = document.getElementById('github-token');
            const gistIdInput = document.getElementById('gist-id');
            const autoSyncCheckbox = document.getElementById('auto-sync-enabled');
            const syncIntervalSelect = document.getElementById('sync-interval');

            if (tokenInput) tokenInput.value = '';
            if (gistIdInput) gistIdInput.value = '';
            if (autoSyncCheckbox) autoSyncCheckbox.checked = false;
            if (syncIntervalSelect) syncIntervalSelect.value = '15';

            this.updateSyncStatus();
            this.updateSyncButtonStates();

            this.showMessage('✅ All settings cleared', 'success');
        } catch (error) {
            this.showMessage(`❌ Failed to clear settings: ${error.message}`, 'error');
        }
    }

    /**
     * Delete remote Gist
     */
    async deleteGist() {
        if (!this.isConfigured()) {
            this.showSyncResult('❌ No Gist configured to delete', 'error');
            return;
        }

        if (!confirm('⚠️ WARNING: This will permanently delete the remote Gist and all synced data. This cannot be undone. Continue?')) {
            return;
        }

        const deleteGistBtn = document.getElementById('delete-gist-btn');

        try {
            if (deleteGistBtn) {
                deleteGistBtn.disabled = true;
                deleteGistBtn.textContent = 'Deleting...';
            }

            // Delete Gist
            const gistSync = this.getGistSync();
            await gistSync.deleteGist(this.settings.gistId);

            // Clear Gist ID from settings
            this.settings.gistId = '';
            this.saveSettings();

            const gistIdInput = document.getElementById('gist-id');
            if (gistIdInput) {
                gistIdInput.value = '';
            }

            this.showSyncResult('✅ Gist deleted successfully', 'success');
            this.updateSyncStatus();
            this.updateSyncButtonStates();

        } catch (error) {
            console.error('❌ Delete failed:', error);
            this.showSyncResult(`❌ Delete failed: ${error.message}`, 'error');
        } finally {
            if (deleteGistBtn) {
                deleteGistBtn.disabled = true; // Keep disabled after delete
                deleteGistBtn.textContent = 'Delete Remote Gist';
            }
        }
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Check if sync is configured
     */
    isConfigured() {
        return !!(this.settings.githubToken && this.settings.gistId);
    }
}
