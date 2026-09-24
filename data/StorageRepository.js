import { defaultSettings } from './DefaultSettings.js';

/**
 * TabSuspender HaYTooL - Layer 1: Data Access Layer
 * StorageRepository manages type-safe reading and writing to Chrome storage.
 */
export class StorageRepository {
    /**
     * Loads settings from chrome.storage.sync with fallback to defaults.
     * @returns {Promise<Object>}
     */
    static async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(defaultSettings, (items) => {
                if (chrome.runtime.lastError) {
                    console.error('[StorageRepository] Error reading sync storage:', chrome.runtime.lastError);
                    resolve({ ...defaultSettings });
                    return;
                }
                resolve(items || { ...defaultSettings });
            });
        });
    }

    /**
     * Saves partial or full settings to chrome.storage.sync.
     * @param {Object} partialSettings
     * @returns {Promise<void>}
     */
    static async saveSettings(partialSettings) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(partialSettings, () => {
                if (chrome.runtime.lastError) {
                    console.error('[StorageRepository] Error writing sync storage:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                    return;
                }
                resolve();
            });
        });
    }

    /**
     * Adds a URL or domain pattern to the excluded whitelist.
     * @param {string} urlPattern
     * @returns {Promise<string>} Updated excludedUrls string
     */
    static async addExcludedUrl(urlPattern) {
        const settings = await this.getSettings();
        let domain = urlPattern;
        try {
            const parsed = new URL(urlPattern);
            domain = parsed.hostname;
        } catch (e) {
            // Keep original string if not a standard URL
        }

        const currentList = (settings.excludedUrls || '')
            .split('\n')
            .map(u => u.trim())
            .filter(Boolean);

        if (!currentList.includes(domain)) {
            currentList.push(domain);
            const updatedUrls = currentList.join('\n');
            await this.saveSettings({ excludedUrls: updatedUrls });
            return updatedUrls;
        }
        return settings.excludedUrls;
    }

    /**
     * Registers a listener for storage changes.
     * @param {Function} callback (changes, areaName) => void
     */
    static onStorageChanged(callback) {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync' || areaName === 'local') {
                callback(changes, areaName);
            }
        });
    }
}
