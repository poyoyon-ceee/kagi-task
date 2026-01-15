/**
 * StateManager - 状態管理
 * 
 * このプロジェクトから再利用
 */

class StateManager {
    constructor() {
        this.state = {};
        this.history = [];
    }

    getState(key = null) {
        if (key === null) return { ...this.state };
        return this.state[key];
    }

    setState(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        if (window.EventBus) {
            window.EventBus.emit('state:updated', {
                oldState,
                newState: this.state,
                changes: this._getChanges(oldState, this.state)
            });
        }
    }

    _getChanges(oldState, newState) {
        const changes = {};
        for (const key of Object.keys(newState)) {
            if (oldState[key] !== newState[key]) {
                changes[key] = { old: oldState[key], new: newState[key] };
            }
        }
        return changes;
    }

    reset() {
        this.state = {};
        this.history = [];
    }
}

// グローバルインスタンス
if (typeof window !== 'undefined') {
    window.StateManager = new StateManager();
}
