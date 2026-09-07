document.addEventListener('DOMContentLoaded', () => {
    const tabList = document.getElementById('tabList');
    const suspendAllBtn = document.getElementById('suspendAllBtn');
    const suspendAllButCurrentBtn = document.getElementById('suspendAllButCurrentBtn');
    const unsuspendAllBtn = document.getElementById('unsuspendAllBtn');
    const loadingMessage = document.getElementById('loadingMessage');
    const unsuspendInBackgroundCheckbox = document.getElementById('unsuspendInBackground');
    const tabCountBadge = document.getElementById('tabCountBadge');

    let currentTabId = null;
    let currentLang = 'tr';

    // Load settings (specifically for theme, language and unsuspendInBackground)
    function loadSettingsForPopup() {
        chrome.storage.sync.get({
            theme: 'light',
            language: 'tr',
            unsuspendInBackground: false
        }, (items) => {
            currentLang = items.language || 'tr';

            document.body.classList.remove('dark-mode', 'theme-discord', 'theme-youtube', 'theme-matrix');
            if (items.theme === 'dark') {
                document.body.classList.add('dark-mode');
            } else if (items.theme === 'discord') {
                document.body.classList.add('theme-discord');
            } else if (items.theme === 'youtube') {
                document.body.classList.add('theme-youtube');
            } else if (items.theme === 'matrix') {
                document.body.classList.add('theme-matrix');
            }

            if (unsuspendInBackgroundCheckbox) {
                unsuspendInBackgroundCheckbox.checked = items.unsuspendInBackground;
            }

            // Apply translations to static elements in popup
            applyPopupTranslations(currentLang);
        });
    }

    function applyPopupTranslations(lang) {
        const t = (k) => typeof getTranslation === 'function' ? getTranslation(lang, k) : k;

        const titleEl = document.getElementById('popupTitle');
        if (titleEl) titleEl.textContent = t('appName');

        const bgLabel = document.getElementById('unsuspendInBackgroundLabel');
        if (bgLabel) bgLabel.textContent = t('unsuspendInBackground');

        const tooltipEl = document.getElementById('unsuspendTooltipText');
        if (tooltipEl) tooltipEl.textContent = t('unsuspendInBackgroundTooltip');

        const tabListLabel = document.getElementById('tabListLabel');
        if (tabListLabel) tabListLabel.textContent = lang === 'tr' ? 'Açık Sekmeler' : 'Open Tabs';

        if (suspendAllBtn) suspendAllBtn.textContent = t('suspendAll');
        if (suspendAllButCurrentBtn) suspendAllButCurrentBtn.textContent = t('suspendOthers');
        if (unsuspendAllBtn) unsuspendAllBtn.textContent = t('unsuspendAll');

        const optLinkText = document.getElementById('optionsLinkText');
        if (optLinkText) optLinkText.textContent = lang === 'tr' ? 'Ayarlar' : 'Settings';

        const webLink = document.getElementById('websiteLink');
        if (webLink) webLink.textContent = '🌐 ' + (lang === 'tr' ? 'Web Sitesi' : 'Website');
    }

    // Save setting when checkbox changes
    if (unsuspendInBackgroundCheckbox) {
        unsuspendInBackgroundCheckbox.addEventListener('change', () => {
            chrome.storage.sync.set({
                unsuspendInBackground: unsuspendInBackgroundCheckbox.checked
            });
        });
    }

    function renderTabs() {
        tabList.innerHTML = '';
        const t = (k) => typeof getTranslation === 'function' ? getTranslation(currentLang, k) : k;

        if (loadingMessage) {
            loadingMessage.textContent = t('loadingTabs');
            loadingMessage.style.display = 'block';
        }

        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            if (loadingMessage) loadingMessage.style.display = 'none';

            if (!tabs || tabs.length === 0) {
                tabList.innerHTML = `<div class="message">${t('noTabs')}</div>`;
                if (tabCountBadge) tabCountBadge.textContent = '0';
                return;
            }

            if (tabCountBadge) {
                tabCountBadge.textContent = tabs.length;
            }

            chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
                if (activeTabs.length > 0) {
                    currentTabId = activeTabs[0].id;
                }

                tabs.forEach(tab => {
                    const tabItem = document.createElement('div');
                    tabItem.classList.add('tab-list-item');

                    const isCurrent = tab.id === currentTabId;
                    if (isCurrent) {
                        tabItem.classList.add('is-current');
                    }

                    // Favicon
                    const faviconImg = document.createElement('img');
                    faviconImg.classList.add('tab-favicon');
                    faviconImg.src = tab.favIconUrl || 'icons/icon16.png';
                    faviconImg.alt = '';
                    faviconImg.onerror = () => {
                        faviconImg.src = 'icons/icon16.png';
                    };
                    tabItem.appendChild(faviconImg);

                    const tabInfo = document.createElement('div');
                    tabInfo.classList.add('tab-info');

                    const isSuspendedPage = tab.url.startsWith(chrome.runtime.getURL('suspended.html'));
                    const isDiscarded = Boolean(tab.discarded);
                    const isSuspended = isSuspendedPage || isDiscarded;

                    // For suspended tabs, pull the real title/url out of the query params
                    let displayTitle = tab.title || tab.url;
                    let displayUrl = tab.url;
                    let originalUrlFromParams = null;

                    if (isSuspendedPage) {
                        try {
                            const urlObj = new URL(tab.url);
                            originalUrlFromParams = urlObj.searchParams.get('originalUrl');
                            const originalTitleFromParams = urlObj.searchParams.get('originalTitle');
                            if (originalUrlFromParams) {
                                displayUrl = decodeURIComponent(originalUrlFromParams);
                            }
                            if (originalTitleFromParams) {
                                displayTitle = decodeURIComponent(originalTitleFromParams);
                            }
                        } catch (e) {
                            console.error('Popup: [RenderTabs] Error parsing URL object for suspended tab (ID: ' + tab.id + '):', tab.url, e);
                        }
                    } else if (isDiscarded) {
                        originalUrlFromParams = tab.url;
                    }

                    const titleRow = document.createElement('div');
                    titleRow.classList.add('tab-title-row');

                    const tabTitle = document.createElement('span');
                    tabTitle.classList.add('tab-title');
                    tabTitle.textContent = displayTitle;
                    titleRow.appendChild(tabTitle);

                    if (isCurrent) {
                        const currentBadge = document.createElement('span');
                        currentBadge.classList.add('badge-active');
                        currentBadge.textContent = t('currentTabMarker').replace(/[()]/g, '');
                        titleRow.appendChild(currentBadge);
                    } else if (isSuspended) {
                        const suspendedBadge = document.createElement('span');
                        suspendedBadge.classList.add('badge-suspended');
                        suspendedBadge.textContent = currentLang === 'tr' ? 'Uyuyor' : 'Sleeping';
                        titleRow.appendChild(suspendedBadge);
                    }

                    const tabUrl = document.createElement('span');
                    tabUrl.classList.add('tab-url');
                    tabUrl.textContent = displayUrl;

                    tabInfo.appendChild(titleRow);
                    tabInfo.appendChild(tabUrl);
                    tabItem.appendChild(tabInfo);

                    let actionButton;
                    if (isSuspended) {
                        actionButton = document.createElement('button');
                        actionButton.classList.add('tab-action-btn', 'unsuspend-btn');
                        actionButton.innerHTML = '☀️ ' + t('unsuspendBtn');

                        actionButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (originalUrlFromParams) {
                                const makeActive = unsuspendInBackgroundCheckbox ? !unsuspendInBackgroundCheckbox.checked : true;
                                chrome.runtime.sendMessage({
                                    action: "unsuspendTabFromPopup",
                                    tabId: tab.id,
                                    url: decodeURIComponent(originalUrlFromParams),
                                    makeActive: makeActive
                                }, response => {
                                    if (response && response.status === "ok") {
                                        renderTabs();
                                    }
                                });
                            } else {
                                console.error('Popup: ERROR - Original URL not found for tab (ID: ' + tab.id + ')');
                                alert('Error: Original URL not found for this suspended tab.');
                            }
                        });
                    } else {
                        actionButton = document.createElement('button');
                        actionButton.classList.add('tab-action-btn', 'suspend-btn');
                        actionButton.innerHTML = '🌙 ' + t('suspendBtn');

                        actionButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            chrome.runtime.sendMessage({
                                action: "suspendTabFromPopup",
                                tabId: tab.id,
                                originalUrl: tab.url,
                                originalTitle: tab.title,
                                faviconUrl: tab.favIconUrl
                            }, response => {
                                if (response && response.status === "ok") {
                                    renderTabs();
                                }
                            });
                        });
                    }

                    tabItem.appendChild(actionButton);
                    tabList.appendChild(tabItem);
                });
            });
        });
    }

    // Bulk Actions
    if (suspendAllButCurrentBtn) {
        suspendAllButCurrentBtn.addEventListener('click', () => {
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                const tabsToSuspend = tabs.filter(tab =>
                    (tab.url.startsWith('http://') || tab.url.startsWith('https://')) &&
                    !tab.active &&
                    !tab.url.startsWith(chrome.runtime.getURL('suspended.html'))
                );
                if (tabsToSuspend.length > 0) {
                    chrome.runtime.sendMessage({ action: "bulkSuspend", tabsToSuspend: tabsToSuspend }, response => {
                        if (response && response.status === "ok") {
                            renderTabs();
                        }
                    });
                }
            });
        });
    }

    if (suspendAllBtn) {
        suspendAllBtn.addEventListener('click', () => {
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                const tabsToSuspend = tabs.filter(tab =>
                    (tab.url.startsWith('http://') || tab.url.startsWith('https://')) &&
                    !tab.url.startsWith(chrome.runtime.getURL('suspended.html'))
                );
                if (tabsToSuspend.length > 0) {
                    chrome.runtime.sendMessage({ action: "bulkSuspend", tabsToSuspend: tabsToSuspend }, response => {
                        if (response && response.status === "ok") {
                            renderTabs();
                        }
                    });
                }
            });
        });
    }

    if (unsuspendAllBtn) {
        unsuspendAllBtn.addEventListener('click', () => {
            chrome.tabs.query({ currentWindow: true, url: chrome.runtime.getURL('suspended.html') + '*' }, (tabs) => {
                const tabsToUnsuspend = tabs.map(tab => {
                    let originalUrl = null;
                    try {
                        const urlObj = new URL(tab.url);
                        const originalUrlEncoded = urlObj.searchParams.get('originalUrl');
                        if (originalUrlEncoded !== null) {
                            originalUrl = decodeURIComponent(originalUrlEncoded);
                        }
                    } catch (e) {
                        console.error('Popup: Error parsing URL object for bulk unsuspend (ID: ' + tab.id + '):', tab.url, e);
                    }
                    return { id: tab.id, url: originalUrl };
                }).filter(tab => tab.url && tab.url !== 'null');

                if (tabsToUnsuspend.length > 0) {
                    chrome.runtime.sendMessage({ action: "bulkUnsuspend", tabsToUnsuspend: tabsToUnsuspend }, response => {
                        if (response && response.status === "ok") {
                            renderTabs();
                        }
                    });
                }
            });
        });
    }

    loadSettingsForPopup();
    renderTabs();

    chrome.tabs.onActivated.addListener(renderTabs);
    chrome.tabs.onUpdated.addListener(renderTabs);
    chrome.tabs.onRemoved.addListener(renderTabs);
});
