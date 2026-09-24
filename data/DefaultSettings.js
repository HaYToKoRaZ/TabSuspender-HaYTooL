/**
 * TabSuspender HaYTooL - Layer 1: Data Access Layer
 * Default configuration and data models.
 */

export const defaultSettings = {
    inactivityTimeValue: 30,
    inactivityTimeUnit: 'minutes',
    disableAutoSuspension: false,
    neverSuspendPinned: true,
    neverSuspendActiveInWindow: false,
    neverSuspendAudio: true,
    neverSuspendOffline: true,
    autoUnsuspendOnView: true,
    excludedUrls: '',
    addContextMenu: false,
    theme: 'light',
    language: 'tr',
    iconClickAction: 'suspendOthers', // 'suspendOthers' | 'popup'
    suspensionMethod: 'page', // 'page' | 'discard'
    restoreTrigger: 'auto', // 'auto' | 'click'
    unsuspendDelay: 0, // seconds: 0, 1, 2, 3, 5
    showRamToast: true,
    animalTheme: 'cat' // 'cat' | 'cat_dark' | 'dog' | 'panda' | 'koala' | 'none'
};

/**
 * Converts a time value and unit to milliseconds.
 * @param {number} value 
 * @param {'seconds'|'minutes'|'hours'} unit 
 * @returns {number} milliseconds
 */
export function convertToMilliseconds(value, unit) {
    switch (unit) {
        case 'seconds': return value * 1000;
        case 'minutes': return value * 60 * 1000;
        case 'hours': return value * 60 * 60 * 1000;
        default: return value * 60 * 1000;
    }
}
