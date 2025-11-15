/**
 * Video Embed Module
 * Detects video platforms and generates embed players
 */

export class VideoEmbed {
    constructor() {
        this.platforms = {
            youtube: {
                patterns: [
                    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
                ],
                embedTemplate: (id) => `https://www.youtube.com/embed/${id}`,
                name: 'YouTube'
            },
            vimeo: {
                patterns: [
                    /vimeo\.com\/(\d+)/,
                    /player\.vimeo\.com\/video\/(\d+)/
                ],
                embedTemplate: (id) => `https://player.vimeo.com/video/${id}`,
                name: 'Vimeo'
            },
            bilibili: {
                patterns: [
                    /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/,
                    /bilibili\.com\/video\/(av\d+)/
                ],
                embedTemplate: (id) => `https://player.bilibili.com/player.html?bvid=${id}`,
                name: 'Bilibili'
            }
        };
    }

    /**
     * Detect if URL is a video link
     */
    isVideoLink(url) {
        const detection = this.detectPlatform(url);
        return detection !== null;
    }

    /**
     * Detect video platform and extract video ID
     */
    detectPlatform(url) {
        if (!url) return null;

        for (const [platform, config] of Object.entries(this.platforms)) {
            for (const pattern of config.patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return {
                        platform,
                        videoId: match[1],
                        platformName: config.name
                    };
                }
            }
        }

        return null;
    }

    /**
     * Get embed URL for a video link
     */
    getEmbedUrl(url) {
        const detection = this.detectPlatform(url);
        if (!detection) return null;

        const config = this.platforms[detection.platform];
        return config.embedTemplate(detection.videoId);
    }

    /**
     * Generate video player HTML
     */
    generatePlayerHtml(url, options = {}) {
        const embedUrl = this.getEmbedUrl(url);
        if (!embedUrl) return null;

        const {
            width = '100%',
            height = '480',
            autoplay = false,
            title = 'Video Player'
        } = options;

        const autoplayParam = autoplay ? '&autoplay=1' : '';
        const finalUrl = embedUrl + (embedUrl.includes('?') ? autoplayParam : '?autoplay=0');

        return `
            <div class="video-embed-container">
                <iframe
                    width="${width}"
                    height="${height}"
                    src="${finalUrl}"
                    title="${this.escapeHtml(title)}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    class="video-embed-iframe">
                </iframe>
            </div>
        `;
    }

    /**
     * Show video in modal
     */
    showVideoModal(url, title = 'Video') {
        const detection = this.detectPlatform(url);
        if (!detection) {
            console.warn('Not a supported video URL:', url);
            return;
        }

        // Create modal if not exists
        let modal = document.getElementById('video-modal');
        if (!modal) {
            modal = this.createVideoModal();
            document.body.appendChild(modal);
        }

        // Set video content
        const modalTitle = modal.querySelector('.video-modal-title');
        const modalBody = modal.querySelector('.video-modal-body');

        modalTitle.textContent = title;
        modalBody.innerHTML = this.generatePlayerHtml(url, { height: '500' });

        // Show modal
        modal.classList.add('active');

        // Attach close events
        this.attachModalEvents(modal);
    }

    /**
     * Create video modal element
     */
    createVideoModal() {
        const modal = document.createElement('div');
        modal.id = 'video-modal';
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3 class="video-modal-title">Video</h3>
                    <button class="video-modal-close">&times;</button>
                </div>
                <div class="video-modal-body">
                    <!-- Video player will be inserted here -->
                </div>
            </div>
        `;
        return modal;
    }

    /**
     * Attach modal close events
     */
    attachModalEvents(modal) {
        const closeBtn = modal.querySelector('.video-modal-close');

        // Close button
        closeBtn.onclick = () => {
            this.closeVideoModal();
        };

        // Click outside to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeVideoModal();
            }
        };

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeVideoModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Close video modal
     */
    closeVideoModal() {
        const modal = document.getElementById('video-modal');
        if (modal) {
            modal.classList.remove('active');
            // Clear video to stop playback
            const modalBody = modal.querySelector('.video-modal-body');
            if (modalBody) {
                modalBody.innerHTML = '';
            }
        }
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
