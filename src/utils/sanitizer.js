/**
 * HTMLSanitizer - XSS対策
 * 
 * このプロジェクトから再利用
 */

const HTMLSanitizer = {
    escape(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    stripTags(str) {
        if (!str) return '';
        return String(str).replace(/<[^>]*>/g, '');
    },

    escapeAttribute(str) {
        if (!str) return '';
        return this.escape(str).replace(/"/g, '&quot;');
    }
};

if (typeof window !== 'undefined') {
    window.HTMLSanitizer = HTMLSanitizer;
}
