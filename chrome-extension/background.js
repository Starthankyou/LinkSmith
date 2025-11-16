/**
 * Background Service Worker
 * Handles video saving and classification
 */

// Import classifier (service workers can import scripts)
importScripts('utils/classifier.js');

const classifier = new AutoClassifier();

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveVideo') {
        handleSaveVideo(request.data)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }

    if (request.action === 'getStats') {
        getStats()
            .then(stats => sendResponse({ success: true, stats }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

/**
 * Handle saving a video to LinkSmith
 */
async function handleSaveVideo(videoData) {
    try {
        // Auto-classify based on title and description
        const categories = classifier.classify(videoData.title, videoData.description);

        // Create link object (matching LinkSmith format)
        const link = {
            id: generateId(),
            url: videoData.url,
            title: videoData.title,
            domain: videoData.domain || 'youtube.com',
            platformTag: videoData.platformTag || 'YouTube',
            tags: categories, // Auto-classified categories
            status: 'unread',
            createdAt: videoData.createdAt || new Date().toISOString(),

            // Additional metadata
            description: videoData.description || '',
            thumbnail: videoData.thumbnail || '',
            channelName: videoData.channelName || '',
            duration: videoData.duration || '',

            // Rating and recommendation fields
            rating: null,
            viewCount: 0,
            lastViewed: null,
            skipCount: 0,
            implicitScore: 0.5,

            // Skip and freeze tracking
            skipUntil: null,
            skipCount: 0,
            frozen: false,
            frozenUntil: null,
            deleted: false
        };

        // Get existing links from chrome.storage.sync
        const storage = await chrome.storage.sync.get(['linksmith_pending_links']);
        const pendingLinks = storage.linksmith_pending_links || [];

        // Check if video already exists
        const exists = pendingLinks.some(l => l.url === link.url);
        if (exists) {
            return {
                success: false,
                error: 'Video already saved',
                duplicate: true
            };
        }

        // Add new link
        pendingLinks.push(link);

        // Save back to chrome.storage.sync
        await chrome.storage.sync.set({ linksmith_pending_links: pendingLinks });

        console.log('✅ Video saved to LinkSmith:', link.title);

        return {
            success: true,
            link: link,
            categories: categories.map(slug => classifier.getCategoryName(slug))
        };

    } catch (error) {
        console.error('❌ Error saving video:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get statistics about saved videos
 */
async function getStats() {
    const storage = await chrome.storage.sync.get(['linksmith_pending_links']);
    const pendingLinks = storage.linksmith_pending_links || [];

    return {
        total: pendingLinks.length,
        unsynced: pendingLinks.filter(l => !l.synced).length
    };
}

/**
 * Generate unique ID (matching LinkSmith format)
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Show notification when video is saved
 */
function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: title,
        message: message,
        priority: 1
    });
}

// Monitor storage usage (chrome.storage.sync has 100KB limit)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.linksmith_pending_links) {
        chrome.storage.sync.getBytesInUse('linksmith_pending_links', (bytes) => {
            const limit = chrome.storage.sync.QUOTA_BYTES; // 102400 bytes = 100KB
            const percentage = (bytes / limit) * 100;

            console.log(`📊 Storage usage: ${bytes} / ${limit} bytes (${percentage.toFixed(1)}%)`);

            if (percentage > 80) {
                console.warn('⚠️ Storage nearly full! Consider syncing to LinkSmith.');
            }
        });
    }
});
