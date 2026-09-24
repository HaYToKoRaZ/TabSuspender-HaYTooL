import { Logger } from '../core/Logger.js';
import { convertToMilliseconds } from '../data/DefaultSettings.js';

/**
 * TabSuspender HaYTooL - Layer 2: Business Logic Layer
 * SuspensionService manages tab suspension lifecycle, timers, RAM calculations, and badge updates.
 */
export class SuspensionService {
    constructor() {
        this.tabActivity = {};
        this.recentlySuspended = new Set();
        this.pendingUnsuspendTimers = {};
        this.inactivityCheckInterval = null;
    }

    /**
     * Updates toolbar badge count with current number of suspended/discarded tabs.
     */
    updateBadge() {
        chrome.tabs.query({}, (tabs) => {
            if (chrome.runtime.lastError || !tabs) return;
            const suspendedUrlPrefix = chrome.runtime.getURL('suspended.html');
            const count = tabs.filter(t => 
                (t.url && t.url.startsWith(suspendedUrlPrefix)) || Boolean(t.discarded)
            ).length;
            chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
            chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
        });
    }

    /**
     * Displays a clean toast notification on the active tab showing saved RAM memory.
     * @param {number} suspendedCount 
     * @param {Object} settings 
     * @param {Function} translateFn 
     */
    async notifyRamSavings(suspendedCount, settings, translateFn) {
        if (!settings.showRamToast || suspendedCount <= 0) return;

        const ramMb = suspendedCount * 120; // ~120MB average savings per tab
        const ramFormatted = ramMb >= 1024 ? `${(ramMb / 1024).toFixed(1)} GB` : `${ramMb} MB`;
        const lang = settings.language || 'tr';
        const key = suspendedCount === 1 ? 'ramToastSingle' : 'ramToastMultiple';
        let msg = typeof translateFn === 'function' ? translateFn(lang, key) : '';
        if (!msg) {
            msg = suspendedCount === 1 
                ? `🌙 Sekme uyutuldu! ~${ramFormatted} RAM tasarrufu sağlandı.` 
                : `🌙 ${suspendedCount} sekme uyutuldu! ~${ramFormatted} RAM tasarrufu sağlandı.`;
        }
        msg = msg.replace('{count}', suspendedCount)
                 .replace('{ram} MB', ramFormatted)
                 .replace('{ram}', ramFormatted);

        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab && activeTab.id && activeTab.url && 
                !activeTab.url.startsWith('chrome://') && 
                !activeTab.url.startsWith('about:') &&
                !activeTab.url.startsWith('edge://')) {
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    func: (toastMessage, theme) => {
                        const id = 'haytool-ram-toast';
                        let el = document.getElementById(id);
                        if (el) el.remove();

                        el = document.createElement('div');
                        el.id = id;
                        el.textContent = toastMessage;
                        
                        let bg = '#1e293b';
                        let color = '#f8fafc';
                        let border = 'rgba(255,255,255,0.15)';
                        if (theme === 'light') {
                            bg = '#ffffff';
                            color = '#0f172a';
                            border = 'rgba(0,0,0,0.12)';
                        } else if (theme === 'matrix') {
                            bg = '#0a110a';
                            color = '#00ff41';
                            border = '#008f11';
                        }

                        Object.assign(el.style, {
                            position: 'fixed',
                            bottom: '32px',
                            right: '32px',
                            zIndex: '2147483647',
                            backgroundColor: bg,
                            color: color,
                            border: `1.5px solid ${border}`,
                            borderRadius: '12px',
                            padding: '16px 24px',
                            fontSize: '15px',
                            fontWeight: '700',
                            letterSpacing: '0.01em',
                            boxShadow: '0 14px 35px rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(8px)',
                            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                            opacity: '0',
                            transform: 'translateY(16px) scale(0.95)',
                            transition: 'opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                            pointerEvents: 'none',
                            maxWidth: '420px'
                        });

                        document.body.appendChild(el);
                        requestAnimationFrame(() => {
                            el.style.opacity = '1';
                            el.style.transform = 'translateY(0) scale(1)';
                        });

                        setTimeout(() => {
                            el.style.opacity = '0';
                            el.style.transform = 'translateY(16px) scale(0.95)';
                            setTimeout(() => el.remove(), 320);
                        }, 4000);
                    },
                    args: [msg, settings.theme || 'dark']
                }).catch(() => {});
            }
        } catch (e) {
            // Silently catch injection errors on special pages
        }
    }

    /**
     * Suspends a given tab either via Native Discard or by navigating to suspended.html.
     */
    async suspendTab(tabId, originalUrl, originalTitle, faviconUrl, settings, translateFn, retries = 3, notifyOnComplete = true) {
        if (!originalUrl || 
            originalUrl.startsWith('chrome://') || 
            originalUrl.startsWith('about:') || 
            originalUrl.startsWith('edge://') ||
            originalUrl.startsWith(chrome.runtime.getURL(''))) {
            Logger.warn('SuspensionService', `Not suspending special tab: ${originalUrl} (Tab ID: ${tabId})`);
            return false;
        }

        // Direct Native Discard Method
        if (settings.suspensionMethod === 'discard') {
            try {
                await chrome.tabs.discard(tabId);
                Logger.info('SuspensionService', `Tab ${tabId} discarded natively: ${originalUrl}`);
                if (notifyOnComplete) this.notifyRamSavings(1, settings, translateFn);
                this.updateBadge();
                return true;
            } catch (discardError) {
                Logger.warn('SuspensionService', `Direct discard failed for tab ${tabId}, falling back to page suspension:`, discardError);
            }
        }

        const encodedTitle = originalTitle ? encodeURIComponent(originalTitle) : '';
        const encodedFavicon = faviconUrl ? encodeURIComponent(faviconUrl) : '';
        const suspendedUrl = chrome.runtime.getURL(
            `suspended.html?originalUrl=${encodeURIComponent(originalUrl)}&originalTitle=${encodedTitle}&favicon=${encodedFavicon}`
        );

        try {
            this.recentlySuspended.add(tabId);
            await chrome.tabs.update(tabId, { url: suspendedUrl });
            Logger.info('SuspensionService', `Tab ${tabId} suspended successfully. Original: ${originalUrl}`);
            if (notifyOnComplete) this.notifyRamSavings(1, settings, translateFn);
            this.updateBadge();
            return true;
        } catch (error) {
            this.recentlySuspended.delete(tabId);
            const msg = error && error.message ? error.message : '';
            if (retries > 0 && (msg.includes('dragging') || msg.includes('cannot be edited'))) {
                Logger.warn('SuspensionService', `Tab ${tabId} is currently dragging/busy. Retrying in 350ms...`);
                setTimeout(() => {
                    this.suspendTab(tabId, originalUrl, originalTitle, faviconUrl, settings, translateFn, retries - 1, notifyOnComplete);
                }, 350);
                return false;
            }
            Logger.error('SuspensionService', `Error suspending tab ${tabId} (${originalUrl}):`, msg);
            return false;
        }
    }

    /**
     * Unsuspends a tab by navigating back to original URL.
     */
    async unsuspendTab(tabId, url, makeActive = false, retries = 3) {
        if (!url) {
            Logger.error('SuspensionService', 'No URL provided to unsuspend tab.');
            return;
        }
        try {
            const updateProps = { url };
            if (makeActive) {
                updateProps.active = true;
            }
            await chrome.tabs.update(tabId, updateProps);
            Logger.info('SuspensionService', `Tab ${tabId} unsuspended to: ${url}`);
            this.updateBadge();
        } catch (error) {
            const msg = error && error.message ? error.message : '';
            if (retries > 0 && (msg.includes('dragging') || msg.includes('cannot be edited'))) {
                Logger.warn('SuspensionService', `Tab ${tabId} is busy. Retrying unsuspend in 350ms...`);
                setTimeout(() => {
                    this.unsuspendTab(tabId, url, makeActive, retries - 1);
                }, 350);
                return;
            }
            Logger.error('SuspensionService', `Error unsuspending tab ${tabId} to ${url}:`, msg);
        }
    }

    /**
     * Handles automatic wakeup with optional delay when user focuses a suspended tab.
     */
    handleTabWakeupWithDelay(tabId, originalUrl, settings) {
        if (settings.restoreTrigger === 'click' || !settings.autoUnsuspendOnView) {
            return;
        }

        const delaySeconds = parseInt(settings.unsuspendDelay, 10) || 0;
        if (delaySeconds <= 0) {
            this.unsuspendTab(tabId, decodeURIComponent(originalUrl), true);
        } else {
            if (this.pendingUnsuspendTimers[tabId]) {
                clearTimeout(this.pendingUnsuspendTimers[tabId]);
            }
            this.pendingUnsuspendTimers[tabId] = setTimeout(() => {
                delete this.pendingUnsuspendTimers[tabId];
                this.unsuspendTab(tabId, decodeURIComponent(originalUrl), true);
            }, delaySeconds * 1000);
        }
    }

    /**
     * Starts periodic timer checking for inactive tabs.
     */
    startInactivityCheck(getSettingsFn, isProtectedFn, translateFn) {
        if (this.inactivityCheckInterval) {
            clearInterval(this.inactivityCheckInterval);
        }

        this.inactivityCheckInterval = setInterval(async () => {
            const settings = await getSettingsFn();
            if (settings.disableAutoSuspension) return;

            const isOffline = typeof navigator !== 'undefined' && 'onLine' in navigator ? !navigator.onLine : false;
            const thresholdMs = convertToMilliseconds(settings.inactivityTimeValue, settings.inactivityTimeUnit);
            const now = Date.now();
            const suspendedPrefix = chrome.runtime.getURL('suspended.html');

            chrome.tabs.query({}, async (tabs) => {
                if (!tabs) return;
                const tabsToSuspend = [];
                for (const tab of tabs) {
                    if (tab.url.startsWith(suspendedPrefix)) continue;

                    const lastActivity = this.tabActivity[tab.id] || tab.lastAccessed;
                    if (now - lastActivity < thresholdMs) continue;

                    if (isProtectedFn(tab, settings, isOffline)) continue;

                    const originalUrl = tab.url;
                    const originalTitle = tab.title || originalUrl;
                    if (originalUrl && 
                        !originalUrl.startsWith('chrome://') && 
                        !originalUrl.startsWith('about:') && 
                        !originalUrl.startsWith('edge://') &&
                        !originalUrl.startsWith(chrome.runtime.getURL(''))) {
                        tabsToSuspend.push({
                            id: tab.id,
                            url: originalUrl,
                            title: originalTitle,
                            favIconUrl: tab.favIconUrl
                        });
                    }
                }

                if (tabsToSuspend.length > 0) {
                    const promises = tabsToSuspend.map(t => 
                        this.suspendTab(t.id, t.url, t.title, t.favIconUrl, settings, translateFn, 3, false)
                    );
                    await Promise.all(promises);
                    this.notifyRamSavings(tabsToSuspend.length, settings, translateFn);
                }
            });
        }, 5000);
    }
}
