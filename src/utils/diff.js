/**
 * DiffRenderer - 差分描画
 * 
 * このプロジェクトから再利用
 */

class DiffRenderer {
    constructor() {
        this.cache = new Map();
    }

    renderDiff(oldElement, newElement, container) {
        if (!oldElement || !newElement || !container) return;

        const oldHTML = oldElement.innerHTML || '';
        const newHTML = newElement.innerHTML || '';

        if (oldHTML === newHTML) {
            return; // 変更なし
        }

        // 簡易的な差分検出と描画
        const diff = this._calculateDiff(oldHTML, newHTML);
        this._applyDiff(container, diff);
    }

    _calculateDiff(oldText, newText) {
        // 簡易的な文字列差分（実装例）
        const changes = [];
        const maxLen = Math.max(oldText.length, newText.length);
        
        for (let i = 0; i < maxLen; i++) {
            if (oldText[i] !== newText[i]) {
                changes.push({
                    index: i,
                    old: oldText[i] || '',
                    new: newText[i] || ''
                });
            }
        }
        
        return changes;
    }

    _applyDiff(container, diff) {
        // 差分を適用（実装例）
        diff.forEach(change => {
            // 実際の実装では、より高度なDOM操作が必要
            console.log('Diff at index', change.index, ':', change.old, '->', change.new);
        });
    }

    clearCache() {
        this.cache.clear();
    }
}

// グローバルインスタンス
if (typeof window !== 'undefined') {
    window.DiffRenderer = new DiffRenderer();
}
