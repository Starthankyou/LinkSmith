/**
 * Auto-classification utility
 * Matches YouTube video metadata to LinkSmith tag categories
 */

class AutoClassifier {
    constructor() {
        // Keyword mapping to tag categories (based on TagLibrary)
        this.categoryKeywords = {
            'tech': {
                name: '技術',
                keywords: ['程式', '編程', 'programming', 'coding', 'developer', 'software', 'algorithm', 'ai', 'machine learning', 'data science', 'tutorial', 'web development', 'python', 'javascript', 'react', 'vue', 'node']
            },
            'design': {
                name: '設計',
                keywords: ['design', 'ui', 'ux', 'graphic', 'photoshop', 'figma', 'sketch', 'logo', 'branding', 'typography', '設計', 'illustrator', 'animation']
            },
            'business': {
                name: '商業',
                keywords: ['business', 'startup', 'entrepreneur', 'marketing', 'sales', 'management', 'strategy', 'finance', 'investment', '創業', '商業', '行銷', '管理']
            },
            'productivity': {
                name: '生產力',
                keywords: ['productivity', 'gtd', 'time management', 'notion', 'obsidian', 'roam', 'workflow', 'efficiency', '效率', '時間管理', 'organization']
            },
            'health': {
                name: '健康',
                keywords: ['health', 'fitness', 'workout', 'yoga', 'nutrition', 'diet', 'exercise', 'wellness', '健康', '健身', '運動', '飲食']
            },
            'finance': {
                name: '理財',
                keywords: ['finance', 'investment', 'stock', 'crypto', 'bitcoin', 'trading', 'money', 'saving', '理財', '投資', '股票', '加密貨幣', 'passive income']
            },
            'education': {
                name: '教育',
                keywords: ['education', 'learning', 'course', 'lecture', 'university', 'school', 'study', 'teach', '教育', '學習', '課程', 'mooc', 'online course']
            },
            'entertainment': {
                name: '娛樂',
                keywords: ['entertainment', 'movie', 'music', 'game', 'gaming', 'fun', 'comedy', 'funny', '娛樂', '電影', '音樂', '遊戲', 'vlog', 'stream']
            },
            'travel': {
                name: '旅遊',
                keywords: ['travel', 'trip', 'tourism', 'vacation', 'adventure', 'explore', '旅遊', '旅行', '探險', 'backpacking', 'destination']
            },
            'cooking': {
                name: '美食',
                keywords: ['cooking', 'recipe', 'food', 'chef', 'cuisine', 'baking', '料理', '食譜', '美食', 'culinary', 'restaurant']
            },
            'lifestyle': {
                name: '生活',
                keywords: ['lifestyle', 'life', 'daily', 'routine', 'home', 'decor', 'minimalism', '生活', '日常', 'morning routine', 'vlog']
            },
            'science': {
                name: '科學',
                keywords: ['science', 'physics', 'chemistry', 'biology', 'astronomy', 'research', 'experiment', '科學', '物理', '化學', '生物', 'documentary']
            },
            'art': {
                name: '藝術',
                keywords: ['art', 'painting', 'drawing', 'sculpture', 'artist', 'gallery', 'museum', '藝術', '繪畫', '雕塑', 'creative', 'artwork']
            },
            'news': {
                name: '新聞',
                keywords: ['news', 'current events', 'politics', 'world', 'breaking', 'report', '新聞', '時事', '政治', 'journalism', 'media']
            },
            'philosophy': {
                name: '哲學',
                keywords: ['philosophy', '思想', 'wisdom', 'thinking', 'ethics', 'logic', 'consciousness', '哲學', 'stoicism', 'existentialism']
            },
            'history': {
                name: '歷史',
                keywords: ['history', 'historical', 'ancient', 'civilization', 'war', 'culture', '歷史', '文化', 'documentary', 'heritage']
            },
            'personal-growth': {
                name: '個人成長',
                keywords: ['personal development', 'self improvement', 'motivation', 'inspiration', 'mindset', 'habit', 'goal', '成長', '自我提升', '習慣', 'self help']
            }
        };
    }

    /**
     * Classify video based on title and description
     * Returns array of matching category slugs
     */
    classify(title, description = '') {
        const text = `${title} ${description}`.toLowerCase();
        const matches = [];

        // Check each category's keywords
        for (const [slug, category] of Object.entries(this.categoryKeywords)) {
            const score = this.calculateMatchScore(text, category.keywords);
            if (score > 0) {
                matches.push({ slug, score, name: category.name });
            }
        }

        // Sort by score (highest first)
        matches.sort((a, b) => b.score - a.score);

        // Return top 3 categories (or fewer if not enough matches)
        return matches.slice(0, 3).map(m => m.slug);
    }

    /**
     * Calculate match score for a category
     */
    calculateMatchScore(text, keywords) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                // Longer keywords get higher scores (more specific)
                score += keyword.length;
            }
        }
        return score;
    }

    /**
     * Get category name by slug
     */
    getCategoryName(slug) {
        return this.categoryKeywords[slug]?.name || slug;
    }
}

// For use in both background and content scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoClassifier;
}
