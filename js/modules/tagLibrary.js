/**
 * Tag Library Module
 * Manages predefined tag categories and custom tags
 */

export class TagLibrary {
    constructor() {
        this.storageKey = 'linksmith_tag_library';
        this.shortcutsKey = 'linksmith_tag_shortcuts';
        this.categories = {};
        this.shortcuts = {};
    }

    /**
     * Initialize tag library
     */
    init() {
        this.loadFromStorage();

        // If no saved library, use defaults
        if (Object.keys(this.categories).length === 0) {
            this.categories = this.getDefaultLibrary();
            this.save();
        }

        // If no saved shortcuts, use defaults
        if (Object.keys(this.shortcuts).length === 0) {
            this.shortcuts = this.getDefaultShortcuts();
            this.saveShortcuts();
        }
    }

    /**
     * Get default tag library
     */
    getDefaultLibrary() {
        return {
            'programming-languages': {
                name: '程式語言學習',
                tags: [
                    'javascript', 'python', 'java', 'go', 'rust',
                    'typescript', 'cpp', 'ruby', 'php', 'swift'
                ]
            },
            'web-development': {
                name: '網站開發',
                tags: [
                    'frontend', 'backend', 'fullstack', 'web-dev',
                    'react', 'vue', 'angular', 'nextjs', 'css', 'html'
                ]
            },
            'ai': {
                name: 'AI',
                tags: [
                    'ai', 'machine-learning', 'deep-learning', 'nlp',
                    'computer-vision', 'llm', 'neural-networks', 'data-science'
                ]
            },
            'people-research': {
                name: '人物研究',
                tags: [
                    'interview', 'biography', 'thought-leader',
                    'influencer', 'expert-opinion', 'founder-story'
                ]
            },
            'learning-knowledge': {
                name: '學習知識',
                tags: [
                    'tutorial', 'course', 'documentation', 'guide',
                    'reference', 'cheatsheet', 'workshop', 'book', 'knowledge'
                ]
            },
            'education': {
                name: '教育類',
                tags: [
                    'education', 'teaching', 'learning-methods', 'pedagogy',
                    'online-learning', 'mooc', 'academic', 'research'
                ]
            },
            'inspiration': {
                name: '啟發性',
                tags: [
                    'inspiration', 'motivation', 'mindset', 'philosophy',
                    'life-lessons', 'wisdom', 'reflection', 'growth'
                ]
            },
            'career': {
                name: '工作職涯',
                tags: [
                    'career', 'job', 'workplace', 'professional-development',
                    'remote-work', 'management', 'leadership', 'interview-prep'
                ]
            },
            'business-startup': {
                name: '商業創業',
                tags: [
                    'business', 'startup', 'entrepreneurship', 'productivity',
                    'growth', 'marketing', 'sales', 'funding', 'strategy'
                ]
            },
            'international-news': {
                name: '國際新聞',
                tags: [
                    'news', 'world-news', 'politics', 'economy',
                    'international', 'current-events', 'analysis'
                ]
            },
            'mindfulness': {
                name: '身心靈',
                tags: [
                    'mindfulness', 'meditation', 'spirituality', 'wellness',
                    'mental-health', 'self-care', 'consciousness', 'peace'
                ]
            },
            'literature': {
                name: '文學類',
                tags: [
                    'literature', 'writing', 'poetry', 'fiction',
                    'non-fiction', 'essay', 'storytelling', 'authors'
                ]
            },
            'science': {
                name: '科學類',
                tags: [
                    'science', 'physics', 'chemistry', 'astronomy',
                    'research', 'scientific-method', 'discovery', 'experiment'
                ]
            },
            'tools': {
                name: '工具類',
                tags: [
                    'tools', 'software', 'app', 'productivity-tools',
                    'utilities', 'automation', 'workflow', 'platform'
                ]
            },
            'biology': {
                name: '生物類',
                tags: [
                    'biology', 'life-science', 'genetics', 'ecology',
                    'evolution', 'microbiology', 'botany', 'zoology'
                ]
            },
            'health': {
                name: '健康類',
                tags: [
                    'health', 'fitness', 'nutrition', 'medicine',
                    'exercise', 'diet', 'healthcare', 'wellbeing'
                ]
            },
            'uncategorized': {
                name: '難以分類',
                tags: [
                    'misc', 'other', 'random', 'interesting',
                    'to-classify', 'general'
                ]
            }
        };
    }

    /**
     * Get default tag shortcuts (combinations)
     */
    getDefaultShortcuts() {
        return {
            'frontend-learning': {
                name: '🚀 前端學習',
                tags: ['frontend', 'tutorial', 'web-dev']
            },
            'python-beginner': {
                name: '🐍 Python 入門',
                tags: ['python', 'tutorial', 'beginner']
            },
            'ai-learning': {
                name: '🤖 AI 學習',
                tags: ['ai', 'machine-learning', 'tutorial']
            },
            'inspiring-reading': {
                name: '💡 啟發閱讀',
                tags: ['inspiration', 'article', 'reading']
            },
            'career-growth': {
                name: '📈 職涯成長',
                tags: ['career', 'growth', 'professional-development']
            },
            'startup-resources': {
                name: '🚀 創業資源',
                tags: ['startup', 'entrepreneurship', 'business']
            }
        };
    }

    /**
     * Load from LocalStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                this.categories = JSON.parse(data);
            }

            const shortcutsData = localStorage.getItem(this.shortcutsKey);
            if (shortcutsData) {
                this.shortcuts = JSON.parse(shortcutsData);
            }
        } catch (error) {
            console.error('Error loading tag library:', error);
        }
    }

    /**
     * Save to LocalStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.categories));
        } catch (error) {
            console.error('Error saving tag library:', error);
        }
    }

    /**
     * Save shortcuts to LocalStorage
     */
    saveShortcuts() {
        try {
            localStorage.setItem(this.shortcutsKey, JSON.stringify(this.shortcuts));
        } catch (error) {
            console.error('Error saving shortcuts:', error);
        }
    }

    /**
     * Get all categories
     */
    getAllCategories() {
        return this.categories;
    }

    /**
     * Get category by slug
     */
    getCategory(slug) {
        return this.categories[slug];
    }

    /**
     * Get all tags from all categories
     */
    getAllTags() {
        const allTags = [];
        Object.values(this.categories).forEach(category => {
            allTags.push(...category.tags);
        });
        return [...new Set(allTags)];
    }

    /**
     * Add new category
     */
    addCategory(slug, name, tags = []) {
        this.categories[slug] = { name, tags };
        this.save();
    }

    /**
     * Update category
     */
    updateCategory(slug, name, tags) {
        if (this.categories[slug]) {
            this.categories[slug] = { name, tags };
            this.save();
        }
    }

    /**
     * Delete category
     */
    deleteCategory(slug) {
        delete this.categories[slug];
        this.save();
    }

    /**
     * Add tag to category
     */
    addTagToCategory(categorySlug, tag) {
        if (this.categories[categorySlug]) {
            if (!this.categories[categorySlug].tags.includes(tag)) {
                this.categories[categorySlug].tags.push(tag);
                this.save();
            }
        }
    }

    /**
     * Remove tag from category
     */
    removeTagFromCategory(categorySlug, tag) {
        if (this.categories[categorySlug]) {
            this.categories[categorySlug].tags =
                this.categories[categorySlug].tags.filter(t => t !== tag);
            this.save();
        }
    }

    /**
     * Get all shortcuts
     */
    getAllShortcuts() {
        return this.shortcuts;
    }

    /**
     * Add shortcut
     */
    addShortcut(id, name, tags) {
        this.shortcuts[id] = { name, tags };
        this.saveShortcuts();
    }

    /**
     * Delete shortcut
     */
    deleteShortcut(id) {
        delete this.shortcuts[id];
        this.saveShortcuts();
    }

    /**
     * Reset to defaults
     */
    resetToDefaults() {
        this.categories = this.getDefaultLibrary();
        this.shortcuts = this.getDefaultShortcuts();
        this.save();
        this.saveShortcuts();
    }

    /**
     * Export library as JSON
     */
    exportLibrary() {
        return {
            categories: this.categories,
            shortcuts: this.shortcuts
        };
    }

    /**
     * Import library from JSON
     */
    importLibrary(data) {
        if (data.categories) {
            this.categories = data.categories;
        }
        if (data.shortcuts) {
            this.shortcuts = data.shortcuts;
        }
        this.save();
        this.saveShortcuts();
    }
}
