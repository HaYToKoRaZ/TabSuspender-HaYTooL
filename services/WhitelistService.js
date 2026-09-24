/**
 * TabSuspender HaYTooL - Layer 2: Business Logic Layer
 * WhitelistService evaluates protection rules, pattern matching, and exclusion logic.
 */
export class WhitelistService {
    /**
     * Checks if a URL matches an exclusion pattern (supports wildcards * and plain substrings).
     * @param {string} url 
     * @param {string} pattern 
     * @returns {boolean}
     */
    static urlMatchesExcluded(url, pattern) {
        if (!pattern || !url) return false;
        if (pattern.includes('*')) {
            const escaped = pattern
                .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // escape regex special chars except *
                .replace(/\*/g, '.*');
            try {
                return new RegExp(escaped).test(url);
            } catch (e) {
                return url.includes(pattern);
            }
        }
        return url.includes(pattern);
    }

    /**
     * Checks if a URL is included in the excluded URLs newline-separated string.
     * @param {string} url 
     * @param {string} excludedUrlsString 
     * @returns {boolean}
     */
    static isTabExcluded(url, excludedUrlsString) {
        if (!url || !excludedUrlsString) return false;
        const patterns = excludedUrlsString
            .split('\n')
            .map(u => u.trim())
            .filter(Boolean);
        return patterns.some(pattern => this.urlMatchesExcluded(url, pattern));
    }

    /**
     * Single source of truth for whether a tab is protected from auto or bulk suspension.
     * @param {chrome.tabs.Tab} tab 
     * @param {Object} settings 
     * @param {boolean} isOffline 
     * @returns {boolean}
     */
    static isTabProtected(tab, settings, isOffline) {
        if (!tab || !tab.url) return true;
        if (settings.neverSuspendPinned && tab.pinned) return true;
        if (settings.neverSuspendActiveInWindow && tab.active) return true;
        if (settings.neverSuspendAudio && tab.audible) return true;
        if (settings.neverSuspendOffline && isOffline) return true;
        if (this.isTabExcluded(tab.url, settings.excludedUrls)) return true;
        return false;
    }

    /**
     * Detects if the browser currently reports being offline.
     * @returns {boolean}
     */
    static getIsOffline() {
        try {
            return typeof navigator !== 'undefined' && 'onLine' in navigator ? !navigator.onLine : false;
        } catch (e) {
            return false;
        }
    }
}
