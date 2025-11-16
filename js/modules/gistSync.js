/**
 * GitHub Gist Sync Module
 * Handles synchronization of LinkSmith data with GitHub Gist
 */

export class GistSync {
    constructor(settings) {
        this.settings = settings;
        this.apiBase = 'https://api.github.com';
    }

    /**
     * Create API headers with authentication
     */
    getHeaders() {
        return {
            'Authorization': `token ${this.settings.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    /**
     * Create a new private Gist
     */
    async createGist(data) {
        try {
            const response = await fetch(`${this.apiBase}/gists`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    description: 'LinkSmith - Personal Knowledge Pool Data',
                    public: false,
                    files: {
                        'linksmith-data.json': {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to create Gist: ${error.message || response.statusText}`);
            }

            const gist = await response.json();
            console.log('✅ Created new Gist:', gist.id);

            return {
                success: true,
                gistId: gist.id,
                url: gist.html_url
            };
        } catch (error) {
            console.error('❌ Error creating Gist:', error);
            throw error;
        }
    }

    /**
     * Read data from Gist
     */
    async readGist(gistId) {
        try {
            const response = await fetch(`${this.apiBase}/gists/${gistId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (response.status === 404) {
                throw new Error('Gist not found. Please check the Gist ID.');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to read Gist: ${error.message || response.statusText}`);
            }

            const gist = await response.json();
            const file = gist.files['linksmith-data.json'];

            if (!file) {
                throw new Error('linksmith-data.json not found in Gist');
            }

            const data = JSON.parse(file.content);
            console.log('✅ Read data from Gist');

            return {
                success: true,
                data: data,
                updatedAt: new Date(gist.updated_at)
            };
        } catch (error) {
            console.error('❌ Error reading Gist:', error);
            throw error;
        }
    }

    /**
     * Write data to Gist
     */
    async writeGist(gistId, data) {
        try {
            const response = await fetch(`${this.apiBase}/gists/${gistId}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    files: {
                        'linksmith-data.json': {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });

            if (response.status === 404) {
                throw new Error('Gist not found. Please check the Gist ID.');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to write Gist: ${error.message || response.statusText}`);
            }

            const gist = await response.json();
            console.log('✅ Wrote data to Gist');

            return {
                success: true,
                updatedAt: new Date(gist.updated_at)
            };
        } catch (error) {
            console.error('❌ Error writing Gist:', error);
            throw error;
        }
    }

    /**
     * Delete a Gist
     */
    async deleteGist(gistId) {
        try {
            const response = await fetch(`${this.apiBase}/gists/${gistId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.status === 404) {
                throw new Error('Gist not found. Please check the Gist ID.');
            }

            if (response.status !== 204) {
                const error = await response.json();
                throw new Error(`Failed to delete Gist: ${error.message || response.statusText}`);
            }

            console.log('✅ Deleted Gist:', gistId);

            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error deleting Gist:', error);
            throw error;
        }
    }

    /**
     * Sync local data with Gist (smart merge)
     */
    async syncData(localLinks) {
        try {
            console.log('🔄 Starting sync...');

            let gistId = this.settings.gistId;
            let remoteData = null;

            // If no Gist ID, create new Gist
            if (!gistId) {
                console.log('📝 No Gist ID found, creating new Gist...');
                const createResult = await this.createGist({
                    links: localLinks,
                    metadata: {
                        version: '1.0',
                        lastModified: new Date().toISOString(),
                        linkCount: localLinks.length
                    }
                });

                gistId = createResult.gistId;

                return {
                    success: true,
                    action: 'created',
                    gistId: gistId,
                    url: createResult.url,
                    merged: localLinks,
                    stats: {
                        uploaded: localLinks.length,
                        downloaded: 0,
                        conflicts: 0
                    }
                };
            }

            // Read remote data
            try {
                const readResult = await this.readGist(gistId);
                remoteData = readResult.data;
            } catch (error) {
                // If Gist not found, create new one
                if (error.message.includes('not found')) {
                    console.log('📝 Gist not found, creating new Gist...');
                    const createResult = await this.createGist({
                        links: localLinks,
                        metadata: {
                            version: '1.0',
                            lastModified: new Date().toISOString(),
                            linkCount: localLinks.length
                        }
                    });

                    return {
                        success: true,
                        action: 'created',
                        gistId: createResult.gistId,
                        url: createResult.url,
                        merged: localLinks,
                        stats: {
                            uploaded: localLinks.length,
                            downloaded: 0,
                            conflicts: 0
                        }
                    };
                }
                throw error;
            }

            // Merge local and remote data
            const mergeResult = this.mergeLinks(localLinks, remoteData.links || []);

            // Write merged data back to Gist
            await this.writeGist(gistId, {
                links: mergeResult.merged,
                metadata: {
                    version: '1.0',
                    lastModified: new Date().toISOString(),
                    linkCount: mergeResult.merged.length
                }
            });

            console.log('✅ Sync completed successfully');

            return {
                success: true,
                action: 'synced',
                gistId: gistId,
                merged: mergeResult.merged,
                stats: mergeResult.stats
            };

        } catch (error) {
            console.error('❌ Sync failed:', error);
            throw error;
        }
    }

    /**
     * Force upload (overwrite remote with local)
     */
    async forceUpload(localLinks) {
        try {
            console.log('⬆️ Force uploading local data...');

            let gistId = this.settings.gistId;

            // Create new Gist if no ID
            if (!gistId) {
                const createResult = await this.createGist({
                    links: localLinks,
                    metadata: {
                        version: '1.0',
                        lastModified: new Date().toISOString(),
                        linkCount: localLinks.length
                    }
                });

                return {
                    success: true,
                    action: 'created',
                    gistId: createResult.gistId,
                    url: createResult.url,
                    count: localLinks.length
                };
            }

            // Overwrite remote data
            await this.writeGist(gistId, {
                links: localLinks,
                metadata: {
                    version: '1.0',
                    lastModified: new Date().toISOString(),
                    linkCount: localLinks.length
                }
            });

            console.log('✅ Force upload completed');

            return {
                success: true,
                action: 'uploaded',
                gistId: gistId,
                count: localLinks.length
            };

        } catch (error) {
            console.error('❌ Force upload failed:', error);
            throw error;
        }
    }

    /**
     * Force download (overwrite local with remote)
     */
    async forceDownload() {
        try {
            console.log('⬇️ Force downloading remote data...');

            const gistId = this.settings.gistId;
            if (!gistId) {
                throw new Error('No Gist ID configured');
            }

            const readResult = await this.readGist(gistId);
            const remoteLinks = readResult.data.links || [];

            console.log('✅ Force download completed');

            return {
                success: true,
                action: 'downloaded',
                links: remoteLinks,
                count: remoteLinks.length
            };

        } catch (error) {
            console.error('❌ Force download failed:', error);
            throw error;
        }
    }

    /**
     * Merge local and remote links
     * Strategy: Union by ID, newest wins for conflicts
     */
    mergeLinks(localLinks, remoteLinks) {
        const linkMap = new Map();
        let uploadedCount = 0;
        let downloadedCount = 0;
        let conflictCount = 0;

        // Add all remote links first
        remoteLinks.forEach(link => {
            linkMap.set(link.id, {
                ...link,
                _source: 'remote'
            });
        });

        // Merge local links
        localLinks.forEach(localLink => {
            const existing = linkMap.get(localLink.id);

            if (!existing) {
                // New local link - upload to remote
                linkMap.set(localLink.id, {
                    ...localLink,
                    _source: 'local'
                });
                uploadedCount++;
            } else {
                // Conflict - compare timestamps
                const localTime = new Date(localLink.createdAt || 0).getTime();
                const remoteTime = new Date(existing.createdAt || 0).getTime();

                if (localTime > remoteTime) {
                    // Local is newer - keep local version
                    linkMap.set(localLink.id, {
                        ...localLink,
                        _source: 'local'
                    });
                    conflictCount++;
                } else if (remoteTime > localTime) {
                    // Remote is newer - keep remote version
                    conflictCount++;
                } else {
                    // Same timestamp - merge fields (prefer non-null values)
                    linkMap.set(localLink.id, {
                        ...existing,
                        ...this.mergeFields(existing, localLink),
                        _source: 'merged'
                    });
                }
            }
        });

        // Count downloads (remote links not in local)
        const localIds = new Set(localLinks.map(l => l.id));
        remoteLinks.forEach(link => {
            if (!localIds.has(link.id)) {
                downloadedCount++;
            }
        });

        // Convert map to array and remove _source flag
        const merged = Array.from(linkMap.values()).map(link => {
            const { _source, ...cleanLink } = link;
            return cleanLink;
        });

        return {
            merged,
            stats: {
                uploaded: uploadedCount,
                downloaded: downloadedCount,
                conflicts: conflictCount,
                total: merged.length
            }
        };
    }

    /**
     * Merge individual link fields (prefer non-null, newer values)
     */
    mergeFields(remote, local) {
        const merged = {};

        // Rating: prefer rated over unrated
        if (local.rating !== null && local.rating !== undefined) {
            merged.rating = local.rating;
        } else if (remote.rating !== null && remote.rating !== undefined) {
            merged.rating = remote.rating;
        }

        // View count: use maximum
        merged.viewCount = Math.max(local.viewCount || 0, remote.viewCount || 0);

        // Last viewed: use most recent
        const localViewed = local.lastViewed ? new Date(local.lastViewed).getTime() : 0;
        const remoteViewed = remote.lastViewed ? new Date(remote.lastViewed).getTime() : 0;
        if (localViewed > remoteViewed) {
            merged.lastViewed = local.lastViewed;
        } else if (remoteViewed > 0) {
            merged.lastViewed = remote.lastViewed;
        }

        // Skip count: use maximum
        merged.skipCount = Math.max(local.skipCount || 0, remote.skipCount || 0);

        // Implicit score: use average
        const localScore = local.implicitScore || 0.5;
        const remoteScore = remote.implicitScore || 0.5;
        merged.implicitScore = (localScore + remoteScore) / 2;

        // Status: prefer read over unread
        if (local.status === 'read' || remote.status === 'read') {
            merged.status = 'read';
        } else if (local.status === 'frozen' || remote.status === 'frozen') {
            merged.status = 'frozen';
        }

        // Tags: union of both
        const localTags = new Set(local.tags || []);
        const remoteTags = new Set(remote.tags || []);
        merged.tags = Array.from(new Set([...localTags, ...remoteTags]));

        // Deleted: true if either is deleted
        merged.deleted = local.deleted || remote.deleted || false;

        // Frozen: true if either is frozen
        merged.frozen = local.frozen || remote.frozen || false;

        return merged;
    }
}
