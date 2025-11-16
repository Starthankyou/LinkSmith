/**
 * Popup Script
 * Handles UI interactions for the extension popup
 */

let currentVideoData = null;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔗 LinkSmith popup initialized');

    // Show loading state
    showState('loading');

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if we're on a YouTube page
    if (!tab.url || !tab.url.includes('youtube.com/watch?v=')) {
        showState('not-video');
        return;
    }

    // Get video data from content script
    chrome.tabs.sendMessage(tab.id, { action: 'getVideoData' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error getting video data:', chrome.runtime.lastError);
            showError('Failed to extract video data. Please refresh the page and try again.');
            return;
        }

        if (response && response.success && response.data) {
            currentVideoData = response.data;
            showVideoPreview(response.data);
        } else {
            showState('not-video');
        }
    });

    // Update storage info
    updateStorageInfo();

    // Attach button listeners
    attachButtonListeners();
});

/**
 * Show video preview
 */
function showVideoPreview(videoData) {
    // Import classifier to show categories
    const script = document.createElement('script');
    script.src = '../utils/classifier.js';
    script.onload = () => {
        const classifier = new AutoClassifier();
        const categories = classifier.classify(videoData.title, videoData.description);

        // Populate UI
        document.getElementById('thumbnail').src = videoData.thumbnail;
        document.getElementById('video-title').textContent = videoData.title;
        document.getElementById('channel-name').textContent = videoData.channelName || 'YouTube';

        // Show categories
        const categoriesContainer = document.getElementById('categories');
        if (categories.length > 0) {
            categoriesContainer.innerHTML = categories
                .map(slug => `<span class="category-tag">${classifier.getCategoryName(slug)}</span>`)
                .join('');
        } else {
            categoriesContainer.innerHTML = '<span class="category-tag">未分類</span>';
        }

        showState('video-preview');
    };
    document.head.appendChild(script);
}

/**
 * Show specific state
 */
function showState(stateName) {
    // Hide all states
    document.querySelectorAll('.state').forEach(state => {
        state.classList.add('hidden');
    });

    // Show requested state
    const stateElement = document.getElementById(stateName);
    if (stateElement) {
        stateElement.classList.remove('hidden');
    }
}

/**
 * Show error
 */
function showError(message) {
    document.getElementById('error-message').textContent = message;
    showState('error');
}

/**
 * Attach button listeners
 */
function attachButtonListeners() {
    // Save button
    document.getElementById('save-btn')?.addEventListener('click', async () => {
        if (!currentVideoData) return;

        // Disable button
        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = '💾 Saving...';

        // Send to background for processing
        chrome.runtime.sendMessage({
            action: 'saveVideo',
            data: currentVideoData
        }, (response) => {
            if (response && response.success) {
                // Show success
                updateStorageInfo();
                showSuccessState();
            } else if (response && response.duplicate) {
                // Already saved
                showState('duplicate');
            } else {
                // Show error
                showError(response?.error || 'Failed to save video');
            }
        });
    });

    // Open LinkSmith button
    document.getElementById('open-linksmith-btn')?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:8000' });
    });

    // View LinkSmith button
    document.getElementById('view-linksmith-btn')?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:8000' });
    });

    // Retry button
    document.getElementById('retry-btn')?.addEventListener('click', () => {
        window.location.reload();
    });
}

/**
 * Show success state with stats
 */
async function showSuccessState() {
    // Get stats
    chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
        if (response && response.success) {
            const stats = response.stats;
            document.getElementById('stats').innerHTML = `
                <div>📊 Total saved: <strong>${stats.total}</strong></div>
                ${stats.unsynced > 0 ? `<div>⏳ Pending sync: <strong>${stats.unsynced}</strong></div>` : ''}
            `;
        }
        showState('success');
    });
}

/**
 * Update storage info in footer
 */
async function updateStorageInfo() {
    chrome.storage.sync.getBytesInUse('linksmith_pending_links', (bytes) => {
        const limit = chrome.storage.sync.QUOTA_BYTES; // 102400 bytes
        const percentage = (bytes / limit) * 100;

        const storageInfo = document.getElementById('storage-info');
        if (percentage > 80) {
            storageInfo.innerHTML = `<span class="storage-warning">⚠️ Storage ${percentage.toFixed(0)}% full - Please sync to LinkSmith</span>`;
        } else {
            storageInfo.textContent = `Storage: ${percentage.toFixed(0)}% used`;
        }
    });
}
