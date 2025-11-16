/**
 * LinkSmith Helper Content Script
 * Injected into localhost pages to enable communication with the extension
 */

// Inject the extension ID into the page so it can communicate back
const script = document.createElement('script');
script.textContent = `
    // Make extension ID available to the page
    window.LINKSMITH_EXTENSION_ID = '${chrome.runtime.id}';
    console.log('🔗 LinkSmith Extension detected:', window.LINKSMITH_EXTENSION_ID);
`;
document.documentElement.appendChild(script);
script.remove();
