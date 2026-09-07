importScripts('i18n.js');

let suspensionSettings = {};

const defaultSettings = {
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

function updateActionPopup(actionSetting) {
    if (actionSetting === 'suspendOthers') {
        chrome.action.setPopup({ popup: '' });
    } else {
        chrome.action.setPopup({ popup: 'popup.html' });
    }
}

function convertToMilliseconds(value, unit) {
    switch (unit) {
        case 'seconds': return value * 1000;
        case 'minutes': return value * 60 * 1000;
        case 'hours': return value * 60 * 60 * 1000;
        default: return value * 60 * 1000; // Default to minutes if unit is unknown
    }
}

function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(defaultSettings, (items) => {
            suspensionSettings = items;
            updateContextMenu();
            updateActionPopup(suspensionSettings.iconClickAction);
            resolve(suspensionSettings);
        });
    });
}

// FIX: supports * wildcards (e.g. "*.reddit.com/*"), falls back to plain substring match
function urlMatchesExcluded(url, pattern) {
    if (!pattern) return false;
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

function isTabExcluded(url) {
    const excludedUrlsArray = (suspensionSettings.excludedUrls || '')
        .split('\n')
        .map(u => u.trim())
        .filter(u => u !== '');
    return excludedUrlsArray.some(pattern => urlMatchesExcluded(url, pattern));
}

// NEW: single source of truth for "should this tab be left alone" — used by the
// automatic inactivity checker AND every manual bulk-suspend path (buttons,
// keyboard shortcuts, bulkSuspend messages) so they can't disagree anymore.
function isTabProtected(tab, isOffline) {
    if (suspensionSettings.neverSuspendPinned && tab.pinned) return true;
    if (suspensionSettings.neverSuspendActiveInWindow && tab.active) return true;
    if (suspensionSettings.neverSuspendAudio && tab.audible) return true;
    if (suspensionSettings.neverSuspendOffline && isOffline) return true;
    if (isTabExcluded(tab.url)) return true;
    return false;
}

function getIsOffline() {
    try {
        return typeof navigator !== 'undefined' && 'onLine' in navigator ? !navigator.onLine : false;
    } catch (e) {
        return false;
    }
}

// NEW: keeps the toolbar badge showing how many tabs are currently suspended (either suspended.html or discarded)
function updateBadge() {
    chrome.tabs.query({}, (tabs) => {
        const count = tabs.filter(t => 
            (t.url && t.url.startsWith(chrome.runtime.getURL('suspended.html'))) || Boolean(t.discarded)
        ).length;
        chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
        chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
    });
}

// Map to track pending unsuspend timers when delay > 0
let pendingUnsuspendTimers = {};

// Helper: Show RAM savings notification on the active tab or via badge
async function notifyRamSavings(suspendedCount) {
    if (!suspensionSettings.showRamToast || suspendedCount <= 0) return;

    const ramMb = suspendedCount * 120; // ~120MB average savings per tab
    const ramFormatted = ramMb >= 1024 ? `${(ramMb / 1024).toFixed(1)} GB` : `${ramMb} MB`;
    const lang = suspensionSettings.language || 'tr';
    const key = suspendedCount === 1 ? 'ramToastSingle' : 'ramToastMultiple';
    let msg = typeof getTranslation === 'function' ? getTranslation(lang, key) : '';
    if (!msg) {
        msg = suspendedCount === 1 
            ? `🌙 Sekme uyutuldu! ~${ramFormatted} RAM tasarrufu sağlandı.` 
            : `🌙 ${suspendedCount} sekme uyutuldu! ~${ramFormatted} RAM tasarrufu sağlandı.`;
    }
    // Replace {ram} with formatted string (e.g. 240 MB or 1.2 GB) or backward compatible without duplicate 'MB'
    msg = msg.replace('{count}', suspendedCount)
             .replace('{ram} MB', ramFormatted)
             .replace('{ram}', ramFormatted);

    // Inject in-page toast to active tab if possible
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab && activeTab.id && activeTab.url && !activeTab.url.startsWith('chrome://') && !activeTab.url.startsWith('about:')) {
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
                args: [msg, suspensionSettings.theme || 'dark']
            }).catch(() => {});
        }
    } catch (e) {
        // Silently catch injection errors on special pages
    }
}

async function suspendTab(tabId, originalUrl, originalTitle, faviconUrl, retries = 3, notifyOnComplete = true) {
    if (!originalUrl || originalUrl.startsWith('chrome://') || originalUrl.startsWith('about:') || originalUrl.startsWith(chrome.runtime.getURL(''))) {
        console.warn(`Background: Not suspending special tab: ${originalUrl} (Tab ID: ${tabId})`);
        return false;
    }

    // Check suspension method: Direct Native Discard vs Info Page
    if (suspensionSettings.suspensionMethod === 'discard') {
        try {
            await chrome.tabs.discard(tabId);
            console.log(`Background: Tab ${tabId} discarded natively without changing URL: ${originalUrl}`);
            if (notifyOnComplete) notifyRamSavings(1);
            updateBadge();
            return true;
        } catch (discardError) {
            console.warn(`Background: Direct discard failed for tab ${tabId}, falling back to page suspension:`, discardError);
        }
    }

    const encodedTitle = originalTitle ? encodeURIComponent(originalTitle) : '';
    const encodedFavicon = faviconUrl ? encodeURIComponent(faviconUrl) : '';
    const suspendedUrl = chrome.runtime.getURL(
        `suspended.html?originalUrl=${encodeURIComponent(originalUrl)}&originalTitle=${encodedTitle}&favicon=${encodedFavicon}`
    );

    try {
        recentlySuspended.add(tabId);
        await chrome.tabs.update(tabId, { url: suspendedUrl });
        console.log(`Background: Tab ${tabId} suspended successfully. Original: ${originalUrl}`);
        if (notifyOnComplete) notifyRamSavings(1);
        updateBadge();
        return true;
    } catch (error) {
        recentlySuspended.delete(tabId);
        const msg = error && error.message ? error.message : '';
        if (retries > 0 && (msg.includes('dragging') || msg.includes('cannot be edited'))) {
            console.warn(`Background: Tab ${tabId} is currently being dragged/busy. Retrying suspension in 350ms (${retries} attempts left)...`);
            setTimeout(() => {
                suspendTab(tabId, originalUrl, originalTitle, faviconUrl, retries - 1, notifyOnComplete);
            }, 350);
            return false;
        }
        console.error(`Background: Error suspending tab ${tabId} (URL: ${originalUrl}): ${msg}`);
        return false;
    }
}

async function unsuspendTab(tabId, url, makeActive = false, retries = 3) {
    if (!url) {
        console.error('Background: No URL provided to unsuspend tab.');
        return;
    }
    console.log(`Background: unsuspendTab function called for tab ${tabId}. Final makeActive value: ${makeActive}`);
    try {
        const updateProperties = { url: url };
        if (makeActive) {
            updateProperties.active = true; // Only set active if explicitly requested
        }
        await chrome.tabs.update(tabId, updateProperties);
        console.log(`Background: Tab ${tabId} unsuspended to: ${url}`);
        updateBadge();
    } catch (error) {
        const msg = error && error.message ? error.message : '';
        if (retries > 0 && (msg.includes('dragging') || msg.includes('cannot be edited'))) {
            console.warn(`Background: Tab ${tabId} is currently being dragged/busy. Retrying unsuspend in 350ms (${retries} attempts left)...`);
            setTimeout(() => {
                unsuspendTab(tabId, url, makeActive, retries - 1);
            }, 350);
            return;
        }
        console.error(`Background: Error unsuspending tab ${tabId} to URL "${url}": ${msg}`);
    }
}

let tabActivity = {};
// Tracks tabIds we just navigated to suspended.html ourselves
let recentlySuspended = new Set();

chrome.runtime.onInstalled.addListener(() => {
    loadSettings();
    startInactivityCheck();
    updateBadge();
});

chrome.runtime.onStartup.addListener(() => {
    loadSettings();
    startInactivityCheck();
    updateBadge();
});

function handleTabWakeupWithDelay(tabId, originalUrl) {
    // If user chose 'click', NEVER restore just by viewing/switching to tab
    if (suspensionSettings.restoreTrigger === 'click' || !suspensionSettings.autoUnsuspendOnView) {
        return;
    }

    const delaySeconds = parseInt(suspensionSettings.unsuspendDelay, 10) || 0;
    if (delaySeconds <= 0) {
        unsuspendTab(tabId, decodeURIComponent(originalUrl), true);
    } else {
        if (pendingUnsuspendTimers[tabId]) {
            clearTimeout(pendingUnsuspendTimers[tabId]);
        }
        pendingUnsuspendTimers[tabId] = setTimeout(() => {
            delete pendingUnsuspendTimers[tabId];
            unsuspendTab(tabId, decodeURIComponent(originalUrl), true);
        }, delaySeconds * 1000);
    }
}

chrome.tabs.onActivated.addListener(activeInfo => {
    tabActivity[activeInfo.tabId] = Date.now();

    // Clear any timers for other tabs that were not focused long enough
    for (const [tId, timer] of Object.entries(pendingUnsuspendTimers)) {
        if (Number(tId) !== activeInfo.tabId) {
            clearTimeout(timer);
            delete pendingUnsuspendTimers[tId];
        }
    }

    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (chrome.runtime.lastError || !tab || !tab.url) return;
        if (tab.url.startsWith(chrome.runtime.getURL('suspended.html'))) {
            let originalUrl = null;
            try {
                originalUrl = new URL(tab.url).searchParams.get('originalUrl');
            } catch (e) {
                console.error('Background: Failed to parse suspended tab URL on activation:', tab.url, e);
            }
            if (originalUrl) {
                handleTabWakeupWithDelay(activeInfo.tabId, originalUrl);
            }
        }
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('about:')) {
        tabActivity[tabId] = Date.now();
        if (tab.url.startsWith(chrome.runtime.getURL('suspended.html'))) {
            if (recentlySuspended.has(tabId)) {
                recentlySuspended.delete(tabId);
                updateBadge();
                return;
            }
            let originalUrl = null;
            try {
                originalUrl = new URL(tab.url).searchParams.get('originalUrl');
            } catch (e) {
                console.error('Background: Failed to parse suspended tab URL:', tab.url, e);
            }
            if (originalUrl) {
                handleTabWakeupWithDelay(tabId, originalUrl);
            }
        }
    }
    updateBadge();
});

chrome.tabs.onRemoved.addListener(tabId => {
    delete tabActivity[tabId];
    recentlySuspended.delete(tabId);
    if (pendingUnsuspendTimers[tabId]) {
        clearTimeout(pendingUnsuspendTimers[tabId]);
        delete pendingUnsuspendTimers[tabId];
    }
    updateBadge();
});

let inactivityCheckInterval;

function startInactivityCheck() {
    if (inactivityCheckInterval) {
        clearInterval(inactivityCheckInterval);
    }

    inactivityCheckInterval = setInterval(async () => {
        await loadSettings();

        if (suspensionSettings.disableAutoSuspension) {
            return;
        }

        // NEW: actually check offline status now instead of having a setting that does nothing
        const isOffline = getIsOffline();

        const suspensionThresholdMs = convertToMilliseconds(suspensionSettings.inactivityTimeValue, suspensionSettings.inactivityTimeUnit);
        const now = Date.now();

        chrome.tabs.query({}, async (tabs) => {
            const tabsToSuspend = [];
            for (const tab of tabs) {
                if (tab.url.startsWith(chrome.runtime.getURL('suspended.html'))) {
                    continue;
                }

                const lastActivity = tabActivity[tab.id] || tab.lastAccessed;
                if (now - lastActivity < suspensionThresholdMs) {
                    continue;
                }

                if (isTabProtected(tab, isOffline)) {
                    continue;
                }

                const originalUrl = tab.url;
                const originalTitle = tab.title || originalUrl; // Fallback to URL if title is empty
                if (originalUrl && !originalUrl.startsWith('chrome://') && !originalUrl.startsWith('about:') && !originalUrl.startsWith(chrome.runtime.getURL(''))) {
                    tabsToSuspend.push({
                        id: tab.id,
                        url: originalUrl,
                        title: originalTitle,
                        favIconUrl: tab.favIconUrl
                    });
                }
            }

            if (tabsToSuspend.length > 0) {
                const promises = tabsToSuspend.map(t => suspendTab(t.id, t.url, t.title, t.favIconUrl, 3, false));
                await Promise.all(promises);
                notifyRamSavings(tabsToSuspend.length);
            }
        });
    }, 5000);
}


function updateContextMenu() {
    chrome.contextMenus.removeAll(() => {
        if (suspensionSettings.addContextMenu) {
            const lang = suspensionSettings.language || 'tr';
            const t = (k) => typeof getTranslation === 'function' ? getTranslation(lang, k) : k;

            chrome.contextMenus.create({
                id: "suspendCurrentTab",
                title: t('contextSuspendTab'),
                contexts: ["page"]
            });
            chrome.contextMenus.create({
                id: "whitelistThisSite",
                title: t('contextWhitelistSite'),
                contexts: ["page"]
            });
        }
    });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "suspendCurrentTab") {
        if (tab && tab.id && tab.url) {
            suspendTab(tab.id, tab.url, tab.title || tab.url, tab.favIconUrl);
        }
    } else if (info.menuItemId === "whitelistThisSite") {
        if (tab && tab.url) {
            addUrlToWhitelist(tab.url);
        }
    }
});

// NEW: shared helper to add a hostname to the excluded list and persist it
function addUrlToWhitelist(url) {
    try {
        const hostname = new URL(url).hostname;
        if (!hostname) return;
        chrome.storage.sync.get({ excludedUrls: '' }, (items) => {
            const list = items.excludedUrls.split('\n').map(u => u.trim()).filter(u => u !== '');
            if (!list.includes(hostname)) {
                list.push(hostname);
                chrome.storage.sync.set({ excludedUrls: list.join('\n') }, () => {
                    loadSettings();
                });
            }
        });
    } catch (e) {
        console.error('Background: Could not whitelist URL:', url, e);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "suspendTabFromPopup" && request.tabId && request.originalUrl) {
        suspendTab(request.tabId, request.originalUrl, request.originalTitle, request.faviconUrl);
        sendResponse({ status: "ok" });
    } else if (request.action === "unsuspendTabFromPopup" && request.tabId && request.url) {
        console.log(`Background: Received unsuspendTabFromPopup message for tab ${request.tabId}. Received makeActive: ${request.makeActive}`);
        unsuspendTab(request.tabId, request.url, request.makeActive);
        sendResponse({ status: "ok" });
    } else if (request.action === "bulkSuspend" && request.tabsToSuspend) {
        console.log('Background: Received bulkSuspend request with tabs:', request.tabsToSuspend.map(t => t.url));
        const isOffline = getIsOffline();
        let actuallySuspendedCount = 0;
        const promises = [];

        request.tabsToSuspend.forEach(tab => {
            if (tab.url && !tab.url.startsWith(chrome.runtime.getURL('suspended.html'))) {
                if (isTabProtected(tab, isOffline)) {
                    console.log(`Background: Skipping protected tab in bulk suspend: ${tab.url}`);
                    return;
                }
                actuallySuspendedCount++;
                promises.push(suspendTab(tab.id, tab.url, tab.title || tab.url, tab.favIconUrl, 3, false));
            } else {
                console.warn(`Background: Skipping suspension for already suspended or invalid tab in bulk operation: ${tab.url}`);
            }
        });

        Promise.all(promises).then(() => {
            if (actuallySuspendedCount > 0) {
                notifyRamSavings(actuallySuspendedCount);
            }
        });

        sendResponse({ status: "ok" });
    } else if (request.action === "bulkUnsuspend" && request.tabsToUnsuspend) {
        console.log('Background: Received bulkUnsuspend request with tabs:', request.tabsToUnsuspend.map(t => t.url));
        request.tabsToUnsuspend.forEach(tab => unsuspendTab(tab.id, tab.url, false)); // Unsuspend in background for bulk
        sendResponse({ status: "ok" });
    } else if (request.action === "loadSettingsRequest") {
        loadSettings().then(settings => sendResponse(settings));
        return true; // Indicates async response
    } else if (request.action === "unsuspendTabFromSuspendedPage" && request.url) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url.startsWith(chrome.runtime.getURL('suspended.html'))) {
                unsuspendTab(tabs[0].id, request.url, true); // Make it active
            } else {
                console.warn('Background: unsuspendTabFromSuspendedPage called on non-suspended or inactive tab.');
            }
        });
        sendResponse({ status: "ok" });
    } else if (request.action === "whitelistFromSuspendedPage" && request.url) {
        // NEW: "Never Suspend This Site" button on the suspended page
        addUrlToWhitelist(request.url);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url.startsWith(chrome.runtime.getURL('suspended.html'))) {
                unsuspendTab(tabs[0].id, request.url, true);
            }
        });
        sendResponse({ status: "ok" });
    }
});

chrome.commands.onCommand.addListener((command, tab) => {
    switch (command) {
        case "suspend-current-tab":
            if (tab && tab.id && tab.url) {
                if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('about:') && !tab.url.startsWith(chrome.runtime.getURL('suspended.html'))) {
                    suspendTab(tab.id, tab.url, tab.title || tab.url, tab.favIconUrl);
                } else {
                    console.warn(`Background Command: Cannot suspend special or already suspended tab: ${tab.url}`);
                }
            }
            break;
        case "suspend-all-tabs":
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                const isOffline = getIsOffline();
                const tabsToSuspend = tabs.filter(t =>
                    (t.url.startsWith('http://') || t.url.startsWith('https://')) &&
                    !t.url.startsWith(chrome.runtime.getURL('suspended.html')) &&
                    !isTabProtected(t, isOffline)
                );
                console.log(`Background Command: Suspending ${tabsToSuspend.length} tabs for 'suspend-all-tabs' command.`);
                tabsToSuspend.forEach(t => suspendTab(t.id, t.url, t.title || t.url, t.favIconUrl));
            });
            break;
        case "suspend-all-but-current-tab":
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                const isOffline = getIsOffline();
                const tabsToSuspend = tabs.filter(t =>
                    (t.url.startsWith('http://') || t.url.startsWith('https://')) &&
                    !t.active && // Exclude the active tab
                    !t.url.startsWith(chrome.runtime.getURL('suspended.html')) &&
                    !isTabProtected(t, isOffline)
                );
                console.log(`Background Command: Suspending ${tabsToSuspend.length} tabs for 'suspend-all-but-current-tab' command.`);
                tabsToSuspend.forEach(t => suspendTab(t.id, t.url, t.title || t.url, t.favIconUrl));
            });
            break;
        case "unsuspend-all-tabs":
            chrome.tabs.query({ currentWindow: true, url: chrome.runtime.getURL('suspended.html') + '*' }, (tabs) => {
                const tabsToUnsuspend = tabs.map(t => {
                    let originalUrl = null;
                    try {
                        const urlObj = new URL(t.url);
                        const originalUrlEncoded = urlObj.searchParams.get('originalUrl');
                        if (originalUrlEncoded !== null) {
                            originalUrl = decodeURIComponent(originalUrlEncoded);
                        }
                    } catch (e) {
                        console.error('Background Command: Error parsing URL for bulk unsuspend (ID: ' + t.id + '):', t.url, e);
                    }
                    return { id: t.id, url: originalUrl };
                }).filter(t => t.url && t.url !== 'null'); // Filter out invalid original URLs

                console.log(`Background Command: Unsuspending ${tabsToUnsuspend.length} tabs for 'unsuspend-all-tabs' command.`);
                tabsToUnsuspend.forEach(t => unsuspendTab(t.id, t.url, false)); // Unsuspend in background for bulk
            });
            break;
        default:
            console.warn(`Background Command: Unknown command received: ${command}`);
            break;
    }
});

chrome.action.onClicked.addListener(async (activeTab) => {
    await loadSettings();
    if (suspensionSettings.iconClickAction !== 'suspendOthers') {
        return;
    }

    const isOffline = getIsOffline();
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const tabsToSuspend = tabs.filter(t =>
            (t.url.startsWith('http://') || t.url.startsWith('https://')) &&
            !t.active &&
            t.id !== activeTab.id &&
            !t.url.startsWith(chrome.runtime.getURL('suspended.html')) &&
            !isTabProtected(t, isOffline)
        );

        console.log(`Background Action Click: Suspending ${tabsToSuspend.length} background tabs in current window.`);
        const promises = tabsToSuspend.map(t => suspendTab(t.id, t.url, t.title || t.url, t.favIconUrl, 3, false));

        if (tabsToSuspend.length > 0) {
            chrome.action.setBadgeText({ text: '✓' });
            chrome.action.setBadgeBackgroundColor({ color: '#2ecc71' });
            setTimeout(updateBadge, 1500);

            Promise.all(promises).then(() => {
                notifyRamSavings(tabsToSuspend.length);
            });
        }
    });
});

loadSettings().then(() => {
    startInactivityCheck();
    updateBadge();
});
