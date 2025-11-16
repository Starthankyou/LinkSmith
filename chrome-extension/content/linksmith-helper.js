/**
 * LinkSmith Helper Content Script
 * Injected into localhost pages to enable communication with the extension
 * Uses postMessage to avoid CSP violations
 */

// Send extension ID to the page via postMessage
window.postMessage({
    type: 'LINKSMITH_EXTENSION_READY',
    extensionId: chrome.runtime.id
}, '*');

console.log('🔗 LinkSmith Extension helper loaded, ID:', chrome.runtime.id);

// Listen for sync requests from the page
window.addEventListener('message', (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;

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
