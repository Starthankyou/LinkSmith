/**
 * YouTube Content Script
 * Extracts video metadata from YouTube pages
 */

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVideoData') {
        const videoData = extractVideoData();
        sendResponse({ success: true, data: videoData });
    }
    return true; // Keep channel open for async response
});

/**
 * Extract video data from current YouTube page
 */
function extractVideoData() {
    const url = window.location.href;

    // Check if we're on a video page
    if (!url.includes('watch?v=')) {
        return null;
    }

    // Extract video ID from URL
    const videoId = new URLSearchParams(window.location.search).get('v');
    if (!videoId) {
        return null;
    }

    // Extract title
    let title = '';
    const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string.ytd-video-primary-info-renderer') ||
                        document.querySelector('h1.title yt-formatted-string') ||
                        document.querySelector('h1 yt-formatted-string') ||
                        document.querySelector('meta[name="title"]');

    if (titleElement) {
        title = titleElement.content || titleElement.textContent || titleElement.innerText || '';
    }

    // Fallback to document title
    if (!title) {
        title = document.title.replace(' - YouTube', '');
    }

    // Extract description
    let description = '';
    const descElement = document.querySelector('ytd-text-inline-expander #description-inline-expander yt-attributed-string') ||
                       document.querySelector('#description yt-formatted-string') ||
                       document.querySelector('meta[name="description"]');

    if (descElement) {
        description = descElement.content || descElement.textContent || descElement.innerText || '';
    }

    // Extract channel name
    let channelName = '';
    const channelElement = document.querySelector('ytd-channel-name#channel-name yt-formatted-string a') ||
                          document.querySelector('#owner-name a') ||
                          document.querySelector('meta[itemprop="author"]');

    if (channelElement) {
        channelName = channelElement.content || channelElement.textContent || channelElement.innerText || '';
    }

    // Extract thumbnail
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Extract video duration (if available)
    let duration = '';
    const durationElement = document.querySelector('span.ytp-time-duration');
    if (durationElement) {
        duration = durationElement.textContent;
    }

    // Extract tags/keywords from meta
    let tags = [];
    const keywordsElement = document.querySelector('meta[name="keywords"]');
    if (keywordsElement && keywordsElement.content) {
        tags = keywordsElement.content.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    return {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        videoId: videoId,
        title: title.trim(),
        description: description.trim().substring(0, 500), // Limit description length
        channelName: channelName.trim(),
        thumbnail: thumbnail,
        duration: duration,
        tags: tags.slice(0, 10), // Limit to 10 tags
        domain: 'youtube.com',
        platformTag: 'YouTube',
        createdAt: new Date().toISOString()
    };
}

// Add visual indicator when on YouTube video page
function addSaveIndicator() {
    const url = window.location.href;
    if (!url.includes('watch?v=')) {
        return;
    }

    // Check if indicator already exists
    if (document.getElementById('linksmith-indicator')) {
        return;
    }

    // Create floating indicator
    const indicator = document.createElement('div');
    indicator.id = 'linksmith-indicator';
    indicator.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        cursor: pointer;
        z-index: 10000;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    indicator.innerHTML = '🔗 <span>Save to LinkSmith</span>';

    // Hover effect
    indicator.addEventListener('mouseenter', () => {
        indicator.style.transform = 'scale(1.05)';
        indicator.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
    });

    indicator.addEventListener('mouseleave', () => {
        indicator.style.transform = 'scale(1)';
        indicator.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });

    // Click to save
    indicator.addEventListener('click', async () => {
        const videoData = extractVideoData();
        if (videoData) {
            // Send to background for processing
            chrome.runtime.sendMessage({
                action: 'saveVideo',
                data: videoData
            }, (response) => {
                if (response && response.success) {
                    // Show success feedback
                    indicator.innerHTML = '✅ <span>Saved!</span>';
                    indicator.style.background = 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)';

                    setTimeout(() => {
                        indicator.innerHTML = '🔗 <span>Save to LinkSmith</span>';
                        indicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    }, 2000);
                } else {
                    // Show error feedback
                    indicator.innerHTML = '❌ <span>Error</span>';
                    indicator.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';

                    setTimeout(() => {
                        indicator.innerHTML = '🔗 <span>Save to LinkSmith</span>';
                        indicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    }, 2000);
                }
            });
        }
    });

    document.body.appendChild(indicator);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addSaveIndicator);
} else {
    addSaveIndicator();
}

// Re-add indicator when navigating to new video (YouTube is SPA)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        // Remove old indicator
        const oldIndicator = document.getElementById('linksmith-indicator');
        if (oldIndicator) {
            oldIndicator.remove();
        }
        // Add new one if on video page
        setTimeout(addSaveIndicator, 1000); // Wait for page to load
    }
});

observer.observe(document.body, { childList: true, subtree: true });
