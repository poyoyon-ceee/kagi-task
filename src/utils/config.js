/**
 * ConfigManager - 設定管理
 * 
 * このプロジェクトから再利用
 */

class ConfigManager {
    constructor() {
        this.config = {};
        this.defaults = {};
    }

    setDefault(key, value) {
        this.defaults[key] = value;
    }

    get(key, defaultValue = null) {
        if (key in this.config) {
            return this.config[key];
        }
        if (key in this.defaults) {
            return this.defaults[key];
        }
        return defaultValue;
    }

    set(key, value) {
        this.config[key] = value;
        if (window.EventBus) {
            window.EventBus.emit('config:updated', { key, value });
        }
    }

    loadFromStorage(storageKey = 'app_config') {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                this.config = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Config load error:', error);
        }
    }

    saveToStorage(storageKey = 'app_config') {
        try {
            localStorage.setItem(storageKey, JSON.stringify(this.config));
        } catch (error) {
            console.error('Config save error:', error);
        }
    }

    reset() {
        this.config = {};
    }
}

// グローバルインスタンス
if (typeof window !== 'undefined') {
    window.ConfigManager = new ConfigManager();
}
