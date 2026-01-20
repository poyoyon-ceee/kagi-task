/**
 * DataMigrationManager - データマイグレーション
 * 
 * このプロジェクトから再利用
 */

const DataMigrationManager = {
    currentVersion: '1.0.0',

    migrate(data, fromVersion) {
        console.log(`Migration from ${fromVersion} to ${this.currentVersion}`);
        // マイグレーションロジックをここに追加
        return data;
    },

    getVersion(data) {
        return data.version || '1.0.0';
    },

    setVersion(data, version) {
        data.version = version;
        return data;
    }
};

if (typeof window !== 'undefined') {
    window.DataMigrationManager = DataMigrationManager;
}
