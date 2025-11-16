/**
 * LinkSmith Helper Content Script
 * Injected into LinkSmith web pages to enable communication with the extension
 * Supports both localhost (http://localhost:*) and GitHub Pages (https://starthankyou.github.io/*)
 * Uses postMessage to avoid CSP violations
 */

console.log('🔗 LinkSmith Extension helper loaded, ID:', chrome.runtime.id);

// Listen for messages from the page
window.addEventListener('message', (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;

    // Page is checking if extension exists - respond
    if (event.data.type === 'LINKSMITH_PAGE_READY') {
        console.log('📨 Page ready, announcing extension presence');
        window.postMessage({
            type: 'LINKSMITH_EXTENSION_READY',
            extensionId: chrome.runtime.id
        }, '*');
    }

    if (event.data.type === 'LINKSMITH_SYNC_REQUEST') {
        console.log('📨 Received sync request from page');

        // Forward to background script
        chrome.runtime.sendMessage(
            { action: 'syncFromExtension' },
            (response) => {
                // Send response back to page
                window.postMessage({
                    type: 'LINKSMITH_SYNC_RESPONSE',
                    data: response
                }, '*');
            }
        );
    }

    if (event.data.type === 'LINKSMITH_CLEAR_REQUEST') {
        console.log('🗑️ Received clear request from page');

        // Forward to background script
        chrome.runtime.sendMessage(
            { action: 'clearSyncedLinks' },
            (response) => {
                // Send response back to page
                window.postMessage({
                    type: 'LINKSMITH_CLEAR_RESPONSE',
                    data: response
                }, '*');
            }
        );
    }
});
