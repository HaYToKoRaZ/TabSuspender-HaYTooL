document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const originalUrl = urlParams.get('originalUrl');
    const originalTitle = urlParams.get('originalTitle');
    const favicon = urlParams.get('favicon');

    const originalUrlLink = document.getElementById('originalUrlLink');
    const originalTitleDisplay = document.getElementById('originalTitleDisplay');
    const originalFavicon = document.getElementById('originalFavicon');
    const mascotImg = document.getElementById('mascotImg');
    const mascotContainer = document.getElementById('mascotContainer');
    const siteHostDisplay = document.getElementById('siteHostDisplay');
    const savingsBadgeText = document.getElementById('savingsBadgeText');
    const wakeTabBtn = document.getElementById('wakeTabBtn');
    const wakeTabBtnText = document.getElementById('wakeTabBtnText');
    const headingEl = document.getElementById('suspendedHeading');
    const descEl = document.getElementById('suspendedDesc');
    const hintEl = document.getElementById('restoreHint');

    function applySuspendedSettings(items) {
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

        // Set Animal Mascot
        const animal = items.animalTheme || 'cat';
        if (animal === 'none') {
            if (mascotContainer) mascotContainer.style.display = 'none';
        } else {
            if (mascotContainer) mascotContainer.style.display = 'flex';
            if (mascotImg) mascotImg.src = `animals/${animal}.svg`;
        }

        const lang = (items.language === 'en' || items.language === 'tr') ? items.language : 'tr';
        document.documentElement.lang = lang;
        const t = (k) => typeof getTranslation === 'function' ? getTranslation(lang, k) : k;

        if (headingEl) headingEl.textContent = t('tabSuspendedTitle');
        if (descEl) descEl.textContent = t('suspendedSinceText');
        if (savingsBadgeText) savingsBadgeText.textContent = t('suspendedMemorySavedBadge');
        if (wakeTabBtnText) wakeTabBtnText.textContent = t('restoreTabButton');

        if (hintEl) {
            hintEl.textContent = items.restoreTrigger === 'click' 
                ? t('restoreHintClickOnly') 
                : t('restoreHint');
        }

        if (whitelistBtn) whitelistBtn.textContent = t('whitelistBtn');
    }

    // Load initial theme, language, animalTheme and restoreTrigger
    chrome.storage.sync.get({ 
        theme: 'light', 
        language: 'tr', 
        restoreTrigger: 'auto',
        animalTheme: 'cat'
    }, (items) => {
        applySuspendedSettings(items);
    });

    // Real-time live update when settings (language, theme, mascot) change in options
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync') {
            chrome.storage.sync.get({ 
                theme: 'light', 
                language: 'tr', 
                restoreTrigger: 'auto',
                animalTheme: 'cat'
            }, (items) => {
                applySuspendedSettings(items);
            });
        }
    });

    if (originalUrl) {
        const decoded = decodeURIComponent(originalUrl);
        originalUrlLink.href = decoded;
        originalUrlLink.textContent = decoded;
        try {
            const parsedUrl = new URL(decoded);
            if (siteHostDisplay) siteHostDisplay.textContent = parsedUrl.hostname;
        } catch (e) {
            if (siteHostDisplay) siteHostDisplay.textContent = decoded;
        }
    } else {
        originalUrlLink.textContent = 'Original URL not found.';
        if (siteHostDisplay) siteHostDisplay.textContent = 'Website';
    }

    if (originalTitle) {
        const decodedTitle = decodeURIComponent(originalTitle);
        originalTitleDisplay.textContent = decodedTitle;
        // NEW: set the real browser tab title too, so the tab strip shows the
        // page's actual name instead of just "Tab Suspended"
        document.title = decodedTitle;
    } else {
        originalTitleDisplay.textContent = 'Untitled Tab'; // Fallback if title is missing
    }

    // NEW: set the browser tab's favicon (the little icon in the tab strip itself)
    // to match the original site, not the extension's generic icon
    function setTabFavicon(iconUrl) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = iconUrl;
    }

    // NEW: show the site's real favicon instead of just a generic suspended icon
    if (favicon) {
        const decodedFavicon = decodeURIComponent(favicon);
        if (decodedFavicon) {
            originalFavicon.src = decodedFavicon;
            originalFavicon.style.display = 'inline-block';
            originalFavicon.addEventListener('error', () => {
                originalFavicon.style.display = 'none';
            });
            setTabFavicon(decodedFavicon);
        }
    }

    // NEW: Add click listener to the entire body for restoration
    document.body.addEventListener('click', () => {
        if (originalUrl) {
            chrome.runtime.sendMessage({ action: "unsuspendTabFromSuspendedPage", url: decodeURIComponent(originalUrl) });
        }
    });

    // Keep the URL link's event listener to prevent default browser navigation
    originalUrlLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        event.stopPropagation();
        // The body click listener will handle the actual restoration.
    });

    // Explicit "Wake Up Tab" button click handler
    if (wakeTabBtn) {
        wakeTabBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            if (originalUrl) {
                chrome.runtime.sendMessage({ action: "unsuspendTabFromSuspendedPage", url: decodeURIComponent(originalUrl) });
            }
        });
    }

    // NEW: "Never Suspend This Site" button
    if (whitelistBtn) {
        whitelistBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Don't trigger the body's restore-on-click
            if (originalUrl) {
                whitelistBtn.disabled = true;
                whitelistBtn.textContent = 'Whitelisted \u2014 restoring...';
                chrome.runtime.sendMessage({ action: "whitelistFromSuspendedPage", url: decodeURIComponent(originalUrl) });
            }
        });
    }
});
