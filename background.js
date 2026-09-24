/**
 * TabSuspender HaYTooL - Layer 3: Core Service Worker Coordinator
 * Modular Layered Architecture (N-Tier) Orchestrator.
 */

import { StorageRepository } from './data/StorageRepository.js';
import { WhitelistService } from './services/WhitelistService.js';
import { ContextMenuService } from './services/ContextMenuService.js';
import { SuspensionService } from './services/SuspensionService.js';
import { getTranslation } from './core/i18n.js';
import { Logger } from './core/Logger.js';

const suspensionService = new SuspensionService();
let currentSettings = null;

/**
 * Updates the action icon popup based on iconClickAction setting.
 * @param {string} actionSetting 
 */
function updateActionPopup(actionSetting) {
    if (actionSetting === 'suspendOthers') {
        chrome.action.setPopup({ popup: '' });
    } else {
        chrome.action.setPopup({ popup: 'popup.html' });
    }
}

/**
 * Initializes all layers, loads settings, starts inactivity checker and sets badge.
 */
async function initializeApp() {
    try {
        currentSettings = await StorageRepository.getSettings();
        updateActionPopup(currentSettings.iconClickAction);
        ContextMenuService.updateContextMenu(currentSettings, getTranslation);
        
        suspensionService.startInactivityCheck(
            () => StorageRepository.getSettings(),
            (tab, settings, isOffline) => WhitelistService.isTabProtected(tab, settings, isOffline),
            getTranslation
        );
        suspensionService.updateBadge();
        Logger.info('ServiceWorker', 'TabSuspender HaYTooL initialized successfully (v2.9 Modular).');
    } catch (err) {
        Logger.error('ServiceWorker', 'Failed to initialize application:', err);
    }
}

// Lifecycle listeners
chrome.runtime.onInstalled.addListener(() => {
    initializeApp();
});

chrome.runtime.onStartup.addListener(() => {
    initializeApp();
});

// Watch storage settings changes dynamically
StorageRepository.onStorageChanged((changes) => {
    StorageRepository.getSettings().then((newSettings) => {
        currentSettings = newSettings;
        if (changes.iconClickAction) {
            updateActionPopup(currentSettings.iconClickAction);
        }
        if (changes.addContextMenu || changes.language) {
            ContextMenuService.updateContextMenu(currentSettings, getTranslation);
        }
        if (changes.inactivityTimeValue || changes.inactivityTimeUnit || changes.disableAutoSuspension) {
            suspensionService.startInactivityCheck(
                () => StorageRepository.getSettings(),
                (tab, settings, isOffline) => WhitelistService.isTabProtected(tab, settings, isOffline),
                getTranslation
            );
        }
    });
});

// Tab Activity & Wakeup Listeners
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    suspensionService.tabActivity[activeInfo.tabId] = Date.now();

    // Clear any pending timers for other tabs that were not focused long enough
    for (const [tId, timer] of Object.entries(suspensionService.pendingUnsuspendTimers)) {
        if (Number(tId) !== activeInfo.tabId) {
            clearTimeout(timer);
            delete suspensionService.pendingUnsuspendTimers[tId];
        }
    }

    chrome.tabs.get(activeInfo.tabId, async (tab) => {
        if (chrome.runtime.lastError || !tab || !tab.url) return;
        const suspendedPrefix = chrome.runtime.getURL('suspended.html');
        if (tab.url.startsWith(suspendedPrefix)) {
            let originalUrl = null;
            try {
                originalUrl = new URL(tab.url).searchParams.get('originalUrl');
            } catch (e) {
                Logger.error('ServiceWorker', 'Failed to parse suspended URL on activation:', tab.url, e);
            }
            if (originalUrl) {
                const settings = currentSettings || await StorageRepository.getSettings();
                suspensionService.handleTabWakeupWithDelay(activeInfo.tabId, originalUrl, settings);
            }
        }
    });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && 
        !tab.url.startsWith('chrome://') && 
        !tab.url.startsWith('about:') &&
        !tab.url.startsWith('edge://')) {
        suspensionService.tabActivity[tabId] = Date.now();
        const suspendedPrefix = chrome.runtime.getURL('suspended.html');
        if (tab.url.startsWith(suspendedPrefix)) {
            if (suspensionService.recentlySuspended.has(tabId)) {
                suspensionService.recentlySuspended.delete(tabId);
                suspensionService.updateBadge();
                return;
            }
            let originalUrl = null;
            try {
                originalUrl = new URL(tab.url).searchParams.get('originalUrl');
            } catch (e) {
                Logger.error('ServiceWorker', 'Failed to parse suspended tab URL:', tab.url, e);
            }
            if (originalUrl) {
                const settings = currentSettings || await StorageRepository.getSettings();
                suspensionService.handleTabWakeupWithDelay(tabId, originalUrl, settings);
            }
        }
    }
    suspensionService.updateBadge();
});

chrome.tabs.onRemoved.addListener((tabId) => {
    delete suspensionService.tabActivity[tabId];
    suspensionService.recentlySuspended.delete(tabId);
    if (suspensionService.pendingUnsuspendTimers[tabId]) {
        clearTimeout(suspensionService.pendingUnsuspendTimers[tabId]);
        delete suspensionService.pendingUnsuspendTimers[tabId];
    }
    suspensionService.updateBadge();
});

// Context Menu Routing
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const settings = currentSettings || await StorageRepository.getSettings();
    ContextMenuService.handleClick(info, tab, {
        onSuspendCurrent: (targetTab) => {
            if (targetTab && targetTab.url) {
                suspensionService.suspendTab(
                    targetTab.id, targetTab.url, targetTab.title, targetTab.favIconUrl,
                    settings, getTranslation
                );
            }
        },
        onWhitelistSite: async (targetTab) => {
            if (targetTab && targetTab.url) {
                await StorageRepository.addExcludedUrl(targetTab.url);
                currentSettings = await StorageRepository.getSettings();
                Logger.info('ServiceWorker', `Added site to whitelist: ${targetTab.url}`);
            }
        }
    });
});

// Runtime Messaging Dispatcher
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        const settings = currentSettings || await StorageRepository.getSettings();

        switch (request.action) {
            case "suspendTabFromPopup":
                if (request.tabId && request.originalUrl) {
                    await suspensionService.suspendTab(
                        request.tabId, request.originalUrl, request.originalTitle, request.faviconUrl,
                        settings, getTranslation
                    );
                    sendResponse({ status: "ok" });
                }
                break;

            case "unsuspendTabFromPopup":
                if (request.tabId && request.url) {
                    await suspensionService.unsuspendTab(request.tabId, request.url, request.makeActive);
                    sendResponse({ status: "ok" });
                }
                break;

            case "bulkSuspend":
                if (request.tabsToSuspend && Array.isArray(request.tabsToSuspend)) {
                    const isOffline = WhitelistService.getIsOffline();
                    const suspendedPrefix = chrome.runtime.getURL('suspended.html');
                    const validTabs = request.tabsToSuspend.filter(t => 
                        t.url && 
                        !t.url.startsWith(suspendedPrefix) && 
                        !WhitelistService.isTabProtected(t, settings, isOffline)
                    );

                    const promises = validTabs.map(t => 
                        suspensionService.suspendTab(
                            t.id, t.url, t.title || t.url, t.favIconUrl,
                            settings, getTranslation, 3, false
                        )
                    );
                    await Promise.all(promises);
                    if (validTabs.length > 0) {
                        suspensionService.notifyRamSavings(validTabs.length, settings, getTranslation);
                    }
                    sendResponse({ status: "ok" });
                }
                break;

            case "bulkUnsuspend":
                if (request.tabsToUnsuspend && Array.isArray(request.tabsToUnsuspend)) {
                    request.tabsToUnsuspend.forEach(t => {
                        suspensionService.unsuspendTab(t.id, t.url, false);
                    });
                    sendResponse({ status: "ok" });
                }
                break;

            case "loadSettingsRequest":
                sendResponse(settings);
                break;

            case "unsuspendTabFromSuspendedPage":
                if (request.url) {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const suspendedPrefix = chrome.runtime.getURL('suspended.html');
                        if (tabs[0] && tabs[0].url && tabs[0].url.startsWith(suspendedPrefix)) {
                            suspensionService.unsuspendTab(tabs[0].id, request.url, true);
                        }
                    });
                    sendResponse({ status: "ok" });
                }
                break;

            case "whitelistFromSuspendedPage":
                if (request.url) {
                    await StorageRepository.addExcludedUrl(request.url);
                    currentSettings = await StorageRepository.getSettings();
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const suspendedPrefix = chrome.runtime.getURL('suspended.html');
                        if (tabs[0] && tabs[0].url && tabs[0].url.startsWith(suspendedPrefix)) {
                            suspensionService.unsuspendTab(tabs[0].id, request.url, true);
                        }
                    });
                    sendResponse({ status: "ok" });
                }
                break;

            default:
                sendResponse({ status: "unknown_action" });
                break;
        }
    })();
    return true; // Keep message channel open for async response
});

// Keyboard Commands Routing
chrome.commands.onCommand.addListener(async (command, tab) => {
    const settings = currentSettings || await StorageRepository.getSettings();
    const isOffline = WhitelistService.getIsOffline();
    const suspendedPrefix = chrome.runtime.getURL('suspended.html');

    switch (command) {
        case "suspend-current-tab":
            if (tab && tab.id && tab.url && 
                !tab.url.startsWith('chrome://') && 
                !tab.url.startsWith('about:') && 
                !tab.url.startsWith('edge://') &&
                !tab.url.startsWith(suspendedPrefix)) {
                suspensionService.suspendTab(tab.id, tab.url, tab.title || tab.url, tab.favIconUrl, settings, getTranslation);
            }
            break;

        case "suspend-all-tabs":
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                if (!tabs) return;
                const targets = tabs.filter(t =>
                    t.url &&
                    (t.url.startsWith('http://') || t.url.startsWith('https://')) &&
                    !t.url.startsWith(suspendedPrefix) &&
                    !WhitelistService.isTabProtected(t, settings, isOffline)
                );
                targets.forEach(t => suspensionService.suspendTab(t.id, t.url, t.title || t.url, t.favIconUrl, settings, getTranslation));
            });
            break;

        case "suspend-all-but-current-tab":
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                if (!tabs) return;
                const targets = tabs.filter(t =>
                    t.url &&
                    (t.url.startsWith('http://') || t.url.startsWith('https://')) &&
                    !t.active &&
                    !t.url.startsWith(suspendedPrefix) &&
                    !WhitelistService.isTabProtected(t, settings, isOffline)
                );
                targets.forEach(t => suspensionService.suspendTab(t.id, t.url, t.title || t.url, t.favIconUrl, settings, getTranslation));
            });
            break;

        case "unsuspend-all-tabs":
            chrome.tabs.query({ currentWindow: true, url: suspendedPrefix + '*' }, (tabs) => {
                if (!tabs) return;
                const targets = tabs.map(t => {
                    let originalUrl = null;
                    try {
                        const urlObj = new URL(t.url);
                        const raw = urlObj.searchParams.get('originalUrl');
                        if (raw) originalUrl = decodeURIComponent(raw);
                    } catch (e) {
                        Logger.error('ServiceWorker', 'Error decoding suspended URL:', t.url);
                    }
                    return { id: t.id, url: originalUrl };
                }).filter(t => t.url && t.url !== 'null');

                targets.forEach(t => suspensionService.unsuspendTab(t.id, t.url, false));
            });
            break;
    }
});

// Extension Toolbar Action Click
chrome.action.onClicked.addListener(async (activeTab) => {
    const settings = currentSettings || await StorageRepository.getSettings();
    if (settings.iconClickAction !== 'suspendOthers') return;

    const isOffline = WhitelistService.getIsOffline();
    const suspendedPrefix = chrome.runtime.getURL('suspended.html');

    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        if (!tabs) return;
        const targets = tabs.filter(t =>
            t.url &&
            (t.url.startsWith('http://') || t.url.startsWith('https://')) &&
            !t.active &&
            t.id !== activeTab.id &&
            !t.url.startsWith(suspendedPrefix) &&
            !WhitelistService.isTabProtected(t, settings, isOffline)
        );

        if (targets.length > 0) {
            chrome.action.setBadgeText({ text: '✓' });
            chrome.action.setBadgeBackgroundColor({ color: '#2ecc71' });
            setTimeout(() => suspensionService.updateBadge(), 1500);

            const promises = targets.map(t => 
                suspensionService.suspendTab(t.id, t.url, t.title || t.url, t.favIconUrl, settings, getTranslation, 3, false)
            );
            await Promise.all(promises);
            suspensionService.notifyRamSavings(targets.length, settings, getTranslation);
        }
    });
});

// Kick off initialization
initializeApp();
