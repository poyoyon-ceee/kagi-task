/**
 * EventBus - イベント駆動アーキテクチャの基盤
 * 
 * このプロジェクトから再利用
 */

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.history = [];
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const listeners = this.listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index !== -1) listeners.splice(index, 1);
    }

    emit(event, data = null) {
        this._recordHistory(event, data);
        if (!this.listeners.has(event)) return;
        
        const listeners = [...this.listeners.get(event)];
        listeners.forEach(callback => {
            try {
                callback(data, event);
            } catch (error) {
                console.error(`[EventBus] Error in listener for ${event}:`, error);
            }
        });
    }

    _recordHistory(event, data) {
        this.history.unshift({ event, data, timestamp: new Date().toISOString() });
        if (this.history.length > 100) this.history.pop();
    }

    getHistory(limit = 10) {
        return this.history.slice(0, limit);
    }

    getStats() {
        return {
            totalEvents: this.listeners.size,
            totalListeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0)
        };
    }
}

// グローバルインスタンス
if (typeof window !== 'undefined') {
    window.EventBus = new EventBus();
}
