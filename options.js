document.addEventListener('DOMContentLoaded', () => {
    const inactivityTimeValueInput = document.getElementById('inactivityTimeValue');
    const inactivityTimeUnitSelect = document.getElementById('inactivityTimeUnit');
    const disableAutoSuspensionCheckbox = document.getElementById('disableAutoSuspension');
    const neverSuspendPinnedCheckbox = document.getElementById('neverSuspendPinned');
    const neverSuspendActiveInWindowCheckbox = document.getElementById('neverSuspendActiveInWindow');
    const neverSuspendAudioCheckbox = document.getElementById('neverSuspendAudio');
    const neverSuspendOfflineCheckbox = document.getElementById('neverSuspendOffline');
    const suspensionMethodSelect = document.getElementById('suspensionMethod');
    const restoreTriggerSelect = document.getElementById('restoreTrigger');
    const unsuspendDelaySelect = document.getElementById('unsuspendDelay');
    const delaySettingRow = document.getElementById('delaySettingRow');
    const showRamToastCheckbox = document.getElementById('showRamToast');
    const addContextMenuCheckbox = document.getElementById('addContextMenu');
    const excludedUrlsTextarea = document.getElementById('excludedUrls');
    const themeSelect = document.getElementById('theme');
    const animalThemeSelect = document.getElementById('animalTheme');
    const animalPreviewImg = document.getElementById('animalPreviewImg');
    const animalPreviewEmpty = document.getElementById('animalPreviewEmpty');
    const animalPreviewName = document.getElementById('animalPreviewName');
    const animalPreviewDesc = document.getElementById('animalPreviewDesc');
    const languageSelect = document.getElementById('language');
    const iconClickActionSelect = document.getElementById('iconClickAction');
    const saveButton = document.getElementById('saveButtonBottom');
    const resetButton = document.getElementById('resetButtonBottom');
    const statusMessage = document.getElementById('statusMessageBottom');
    const openShortcutsBtn = document.getElementById('openShortcutsBtn');

    // Gist & Cloud Sync elements
    const githubTokenInput = document.getElementById('githubToken');
    const gistIdInput = document.getElementById('gistId');
    const gistConnectedContainer = document.getElementById('gistConnectedContainer');
    const gistAuthContainer = document.getElementById('gistAuthContainer');
    const gistLogoutBtn = document.getElementById('gistLogoutBtn');
    const gistUserBadge = document.getElementById('gistUserBadge');
    const gistAvatarImg = document.getElementById('gistAvatarImg');
    const gistUsernameText = document.getElementById('gistUsernameText');
    const gistStatusDot = document.getElementById('gistStatusDot');
    const backupGistBtn = document.getElementById('backupGistBtn');
    const restoreGistBtn = document.getElementById('restoreGistBtn');
    const listGistsBtn = document.getElementById('listGistsBtn');
    const backupSelectorContainer = document.getElementById('backupSelectorContainer');
    const backupSelect = document.getElementById('backupSelect');
    const applySelectedBackupBtn = document.getElementById('applySelectedBackupBtn');
    const cancelBackupSelectBtn = document.getElementById('cancelBackupSelectBtn');
    const exportFileBtn = document.getElementById('exportFileBtn');
    const importFileBtn = document.getElementById('importFileBtn');
    const importFileInput = document.getElementById('importFileInput');

    // Default settings (aligned across entire extension)
    const defaultSettings = {
        inactivityTimeValue: 30,
        inactivityTimeUnit: 'minutes',
        disableAutoSuspension: false,
        neverSuspendPinned: true,
        neverSuspendActiveInWindow: false,
        neverSuspendAudio: true,
        neverSuspendOffline: true,
        autoUnsuspendOnView: true,
        suspensionMethod: 'page', // 'page' | 'discard'
        restoreTrigger: 'auto', // 'auto' | 'click'
        unsuspendDelay: 0, // 0, 1, 2, 3, 5
        showRamToast: true,
        animalTheme: 'cat', // 'cat' | 'cat_dark' | 'dog' | 'panda' | 'koala' | 'none'
        excludedUrls: '',
        addContextMenu: false,
        theme: 'light',
        language: 'tr',
        iconClickAction: 'suspendOthers',
        githubToken: '',
        gistId: ''
    };

    function updateLanguage(lang) {
        const activeLang = (lang === 'en' || lang === 'tr') ? lang : 'tr';

        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        const t = (key) => getTranslation(activeLang, key);

        document.documentElement.lang = activeLang;
        document.title = t('settingsTitle');

        setText('i18n-title', t('appName'));
        setText('i18n-subheading', activeLang === 'tr' ? 'Akıllı ve Ultra Hafif Sekme Yönetim Merkezi' : 'Intelligent & Ultra-Light Tab Management Center');
        setText('i18n-saveBtnBottom', t('saveButton'));
        setText('i18n-resetBtnBottom', t('resetButton'));
        setText('statusMessageBottom', '✓ ' + t('settingsSaved'));

        // Dynamic Manifest Version Display
        try {
            const manifest = chrome.runtime.getManifest();
            if (manifest && manifest.version) {
                const vText = `v${manifest.version}`;
                setText('extensionVersionTag', vText);
                setText('footerVersionText', vText);
            }
        } catch (e) {}

        // Card 1: Auto
        setText('i18n-secAuto', t('sectionAutoSuspend'));
        setText('i18n-disableAuto', t('disableAutoSuspension'));
        setText('i18n-suspendAfter', t('suspendAfterLabel'));
        setText('i18n-sec', t('sec'));
        setText('i18n-min', t('min'));
        setText('i18n-hours', t('hours'));

        // Card 2: Exclusions
        setText('i18n-secExcl', t('sectionExclusions'));
        setText('i18n-neverPinned', t('neverSuspendPinned'));
        setText('i18n-neverActive', t('neverSuspendActive'));
        setText('i18n-neverAudio', t('neverSuspendAudio'));
        setText('i18n-neverOffline', t('neverSuspendOffline'));

        // Card 2.5: Suspension Method
        setText('i18n-secSuspensionMethod', t('sectionSuspensionMethod'));
        setText('i18n-suspensionMethodLabel', t('suspensionMethodLabel'));
        setText('i18n-optMethodPage', '📄 ' + t('suspensionMethodPage'));
        setText('i18n-optMethodDiscard', '⚡ ' + t('suspensionMethodDiscard'));
        setText('i18n-suspensionMethodHint', t('suspensionMethodHint'));

        // Card 3: Appearance & Language
        setText('i18n-secApp', t('sectionAppearance'));
        setText('i18n-langLabel', t('languageLabel'));
        setText('i18n-iconClickLabel', t('iconClickActionLabel'));
        setText('i18n-optSuspendOthers', t('iconClickSuspendOthers'));
        setText('i18n-optPopup', t('iconClickPopup'));
        setText('i18n-themeLabel', t('themeLabel'));
        setText('i18n-themeLight', '☀️ ' + t('themeLight'));
        setText('i18n-themeDark', '🌙 ' + t('themeDark'));
        setText('i18n-themeDiscord', '🎮 ' + t('themeDiscord'));
        setText('i18n-themeYouTube', '▶️ ' + t('themeYouTube'));
        setText('i18n-themeMatrix', '🟢 ' + t('themeMatrix'));
        setText('i18n-animalThemeLabel', t('animalThemeLabel'));
        setText('i18n-optAnimalCat', t('animalCat'));
        setText('i18n-optAnimalCatDark', t('animalCatDark'));
        setText('i18n-optAnimalDog', t('animalDog'));
        setText('i18n-optAnimalPanda', t('animalPanda'));
        setText('i18n-optAnimalKoala', t('animalKoala'));
        setText('i18n-optAnimalNone', t('animalNone'));
        setText('i18n-animalThemeHint', t('animalThemeHint'));
        setText('i18n-addContext', t('addContextMenu'));

        // Card 4: Restore & Delay
        setText('i18n-secRestore', t('sectionRestore'));
        setText('i18n-restoreTriggerLabel', t('restoreTriggerLabel'));
        setText('i18n-optTriggerAuto', t('restoreTriggerAuto'));
        setText('i18n-optTriggerClick', t('restoreTriggerClick'));
        setText('i18n-restoreTriggerHint', t('restoreTriggerHint'));
        setText('i18n-unsuspendDelayLabel', t('unsuspendDelayLabel'));
        setText('i18n-optDelay0', t('delayInstant'));
        setText('i18n-optDelay1', t('delay1Sec'));
        setText('i18n-optDelay2', t('delay2Sec'));
        setText('i18n-optDelay3', t('delay3Sec'));
        setText('i18n-optDelay5', t('delay5Sec'));
        setText('i18n-unsuspendDelayHint', t('unsuspendDelayHint'));

        // Card 4.5: Notifications
        setText('i18n-secNotifications', t('sectionNotifications'));
        setText('i18n-showRamToast', t('showRamToastLabel'));
        setText('i18n-showRamToastHint', t('showRamToastHint'));

        // Card 5: Whitelist
        setText('i18n-secWhitelist', t('sectionWhitelist'));
        setText('i18n-whitelistHint', t('whitelistHint'));
        if (excludedUrlsTextarea) {
            excludedUrlsTextarea.placeholder = t('whitelistPlaceholder');
        }

        // Card 6: Shortcuts
        setText('i18n-secShortcuts', t('sectionShortcuts'));
        setText('i18n-shortcutsDesc', t('shortcutsDesc'));
        setText('i18n-shortcutsBtn', t('shortcutsBtn'));
        setText('i18n-shortcutsNote', t('shortcutsNote'));

        // Card 7: Cloud & Gist
        setText('i18n-secGist', t('sectionGist'));
        setText('i18n-gistDesc', t('gistDesc'));
        setText('i18n-gistConnected', t('gistConnected'));
        setText('i18n-gistLogoutBtn', t('gistLogoutBtn'));
        setText('i18n-githubTokenLabel', t('githubTokenLabel'));
        setText('i18n-gistIdLabel', t('gistIdLabel'));
        setText('i18n-btnBackupGist', t('btnBackupGist'));
        setText('i18n-btnRestoreGist', t('btnRestoreGist'));
        setText('i18n-btnListGists', t('btnListGists'));
        setText('i18n-selectBackupPrompt', t('selectBackupPrompt'));
        setText('i18n-gistHelpLink', '🔗 ' + t('gistHelpLink'));
        setText('i18n-btnExportFile', t('btnExportFile'));
        setText('i18n-btnImportFile', t('btnImportFile'));
        if (githubTokenInput) githubTokenInput.placeholder = t('githubTokenPlaceholder');
        if (gistIdInput) gistIdInput.placeholder = t('gistIdPlaceholder');

        // Toggle Gist Connected State UI
        const hasToken = githubTokenInput && githubTokenInput.value.trim().length > 0;
        if (gistConnectedContainer && gistAuthContainer) {
            if (hasToken) {
                gistConnectedContainer.style.display = 'flex';
                gistAuthContainer.style.display = 'none';
                const rawTok = githubTokenInput.value.trim();
                if (gistUserBadge) {
                    gistUserBadge.textContent = `Token: ${rawTok.substring(0, 4)}••••••••${rawTok.slice(-4)}`;
                }
                // Fetch GitHub user profile (avatar & login)
                loadGitHubUserProfile(rawTok);
            } else {
                gistConnectedContainer.style.display = 'none';
                gistAuthContainer.style.display = 'flex';
                if (gistAvatarImg) gistAvatarImg.style.display = 'none';
                if (gistStatusDot) gistStatusDot.style.display = 'inline';
                if (gistUsernameText) gistUsernameText.textContent = '';
            }
        }

        if (applySelectedBackupBtn) {
            applySelectedBackupBtn.innerHTML = `<span>✓</span> <span>${activeLang === 'tr' ? 'Seçilen Yedeği Yükle' : 'Restore Selected Backup'}</span>`;
        }
        if (cancelBackupSelectBtn) {
            cancelBackupSelectBtn.innerHTML = `<span>✕</span> <span>${activeLang === 'tr' ? 'Kapat' : 'Close'}</span>`;
        }

        // Dynamic date in GitHub token link to avoid collision
        const gistHelpLinkEl = document.getElementById('i18n-gistHelpLink');
        if (gistHelpLinkEl) {
            const todayStr = new Date().toISOString().slice(0, 10);
            gistHelpLinkEl.href = `https://github.com/settings/tokens/new?scopes=gist&description=TabSuspender-HaYTooL-Sync-${todayStr}`;
        }

        // Footer
        setText('i18n-linkSite', t('officialSite'));
        setText('i18n-linkPortal', t('portal'));
        setText('i18n-linkGithub', t('githubRepo'));
        setText('i18n-devBy', t('developer'));

        // Update Animal Preview texts with current language
        updateAnimalPreview(animalThemeSelect ? animalThemeSelect.value : 'cat', activeLang);
    }

    // Load settings from storage
    function loadSettings() {
        chrome.storage.sync.get(defaultSettings, (items) => {
            inactivityTimeValueInput.value = items.inactivityTimeValue;
            inactivityTimeUnitSelect.value = items.inactivityTimeUnit;
            disableAutoSuspensionCheckbox.checked = items.disableAutoSuspension;
            neverSuspendPinnedCheckbox.checked = items.neverSuspendPinned;
            neverSuspendActiveInWindowCheckbox.checked = items.neverSuspendActiveInWindow;
            neverSuspendAudioCheckbox.checked = items.neverSuspendAudio;
            neverSuspendOfflineCheckbox.checked = items.neverSuspendOffline;
            if (suspensionMethodSelect) suspensionMethodSelect.value = items.suspensionMethod || 'page';
            if (restoreTriggerSelect) {
                restoreTriggerSelect.value = items.restoreTrigger || 'auto';
                if (delaySettingRow) {
                    delaySettingRow.style.display = items.restoreTrigger === 'click' ? 'none' : 'flex';
                }
            }
            if (unsuspendDelaySelect) unsuspendDelaySelect.value = String(items.unsuspendDelay ?? 0);
            if (showRamToastCheckbox) showRamToastCheckbox.checked = items.showRamToast !== false;
            addContextMenuCheckbox.checked = items.addContextMenu;
            excludedUrlsTextarea.value = items.excludedUrls;
            if (themeSelect) themeSelect.value = items.theme;
            if (animalThemeSelect) animalThemeSelect.value = items.animalTheme || 'cat';
            if (iconClickActionSelect) iconClickActionSelect.value = items.iconClickAction || 'suspendOthers';
            if (githubTokenInput) githubTokenInput.value = items.githubToken || '';
            if (gistIdInput) gistIdInput.value = items.gistId || '';
            const currentLang = items.language || 'tr';
            setActiveLangPill(currentLang);
            applyTheme(items.theme);
            updateLanguage(currentLang);
        });
    }

    // Save settings to storage
    function saveSettings() {
        const lang = languageSelect ? languageSelect.value : 'tr';
        const settings = {
            inactivityTimeValue: parseInt(inactivityTimeValueInput.value, 10) || 15,
            inactivityTimeUnit: inactivityTimeUnitSelect.value,
            disableAutoSuspension: disableAutoSuspensionCheckbox.checked,
            neverSuspendPinned: neverSuspendPinnedCheckbox.checked,
            neverSuspendActiveInWindow: neverSuspendActiveInWindowCheckbox.checked,
            neverSuspendAudio: neverSuspendAudioCheckbox.checked,
            neverSuspendOffline: neverSuspendOfflineCheckbox.checked,
            autoUnsuspendOnView: restoreTriggerSelect ? (restoreTriggerSelect.value === 'auto') : true,
            suspensionMethod: suspensionMethodSelect ? suspensionMethodSelect.value : 'page',
            restoreTrigger: restoreTriggerSelect ? restoreTriggerSelect.value : 'auto',
            unsuspendDelay: unsuspendDelaySelect ? parseInt(unsuspendDelaySelect.value, 10) || 0 : 0,
            showRamToast: showRamToastCheckbox ? showRamToastCheckbox.checked : true,
            animalTheme: animalThemeSelect ? animalThemeSelect.value : 'cat',
            addContextMenu: addContextMenuCheckbox.checked,
            excludedUrls: excludedUrlsTextarea.value,
            theme: themeSelect.value,
            language: lang,
            iconClickAction: iconClickActionSelect ? iconClickActionSelect.value : 'suspendOthers',
            githubToken: githubTokenInput ? githubTokenInput.value.trim() : '',
            gistId: gistIdInput ? gistIdInput.value.trim() : ''
        };

        chrome.storage.sync.set(settings, () => {
            showStatusMessage();
            applyTheme(settings.theme);
            updateLanguage(settings.language);

            // Inform background worker to update context menus and click actions
            chrome.runtime.sendMessage({ action: "loadSettingsRequest" });
        });
    }

    // Restore default settings
    function restoreDefaults() {
        const currentLang = languageSelect ? languageSelect.value : 'tr';
        const confirmMsg = getTranslation(currentLang, 'resetConfirm');

        if (!confirm(confirmMsg)) {
            return;
        }

        chrome.storage.sync.set(defaultSettings, () => {
            loadSettings();
            showStatusMessage(getTranslation(currentLang, 'resetSuccess'));

            // Inform background worker to update state
            chrome.runtime.sendMessage({ action: "loadSettingsRequest" });
        });
    }

    function showStatusMessage(customText) {
        if (customText) {
            if (statusMessage) statusMessage.textContent = '✓ ' + customText;
        }
        if (statusMessage) {
            statusMessage.classList.add('show');
            setTimeout(() => statusMessage.classList.remove('show'), 2500);
        }
    }

    const langBtnTr = document.getElementById('langBtnTr');
    const langBtnEn = document.getElementById('langBtnEn');

    function setActiveLangPill(lang) {
        if (languageSelect) languageSelect.value = lang;
        if (langBtnTr) langBtnTr.classList.toggle('active', lang === 'tr');
        if (langBtnEn) langBtnEn.classList.toggle('active', lang === 'en');
    }

    if (langBtnTr) {
        langBtnTr.addEventListener('click', () => {
            setActiveLangPill('tr');
            updateLanguage('tr');
            chrome.storage.sync.set({ language: 'tr' }, () => {
                showStatusMessage();
                chrome.runtime.sendMessage({ action: "loadSettingsRequest" });
            });
        });
    }

    if (restoreTriggerSelect) {
        restoreTriggerSelect.addEventListener('change', () => {
            if (delaySettingRow) {
                delaySettingRow.style.display = restoreTriggerSelect.value === 'click' ? 'none' : 'flex';
            }
        });
    }

    if (langBtnEn) {
        langBtnEn.addEventListener('click', () => {
            setActiveLangPill('en');
            updateLanguage('en');
            chrome.storage.sync.set({ language: 'en' }, () => {
                showStatusMessage();
                chrome.runtime.sendMessage({ action: "loadSettingsRequest" });
            });
        });
    }

    // Apply theme dynamically
    function applyTheme(theme) {
        document.body.classList.remove('dark-mode', 'theme-discord', 'theme-youtube', 'theme-matrix');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'discord') {
            document.body.classList.add('theme-discord');
        } else if (theme === 'youtube') {
            document.body.classList.add('theme-youtube');
        } else if (theme === 'matrix') {
            document.body.classList.add('theme-matrix');
        }
    }

    // Dynamic Sleeping Animal Mascot Preview
    function updateAnimalPreview(animal, lang) {
        const activeLang = (lang === 'en' || lang === 'tr') ? lang : (languageSelect ? languageSelect.value : 'tr');
        const selected = animal || (animalThemeSelect ? animalThemeSelect.value : 'cat');
        const t = (k) => typeof getTranslation === 'function' ? getTranslation(activeLang, k) : k;

        const animalMap = {
            cat: {
                nameKey: 'animalCat',
                descKey: 'animalDescCat',
                file: 'animals/cat.svg'
            },
            cat_dark: {
                nameKey: 'animalCatDark',
                descKey: 'animalDescCatDark',
                file: 'animals/cat_dark.svg'
            },
            dog: {
                nameKey: 'animalDog',
                descKey: 'animalDescDog',
                file: 'animals/dog.svg'
            },
            panda: {
                nameKey: 'animalPanda',
                descKey: 'animalDescPanda',
                file: 'animals/panda.svg'
            },
            koala: {
                nameKey: 'animalKoala',
                descKey: 'animalDescKoala',
                file: 'animals/koala.svg'
            },
            none: {
                nameKey: 'animalNone',
                descKey: 'animalDescNone',
                file: null
            }
        };

        const current = animalMap[selected] || animalMap.cat;

        if (animalPreviewImg && animalPreviewEmpty) {
            if (current.file) {
                animalPreviewImg.src = current.file;
                animalPreviewImg.style.display = 'block';
                animalPreviewEmpty.style.display = 'none';
            } else {
                animalPreviewImg.style.display = 'none';
                animalPreviewEmpty.style.display = 'inline-block';
            }
        }

        if (animalPreviewName) {
            animalPreviewName.textContent = t(current.nameKey);
        }
        if (animalPreviewDesc) {
            animalPreviewDesc.textContent = t(current.descKey);
        }
    }

    // Event Listeners
    if (animalThemeSelect) {
        animalThemeSelect.addEventListener('change', () => {
            updateAnimalPreview(animalThemeSelect.value);
        });
    }

    if (saveButton) {
        saveButton.addEventListener('click', saveSettings);
    }

    if (resetButton) {
        resetButton.addEventListener('click', restoreDefaults);
    }

    if (themeSelect) {
        themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
    }

    if (openShortcutsBtn) {
        openShortcutsBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
        });
    }

    // --- GITHUB GIST & CLOUD SYNC LOGIC ---

    let cachedGitHubUser = null;

    async function loadGitHubUserProfile(token) {
        if (!token) return;
        if (cachedGitHubUser && cachedGitHubUser.token === token) {
            applyUserUI(cachedGitHubUser.data);
            return;
        }

        try {
            const resp = await fetch('https://api.github.com/user', {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (resp.ok) {
                const userData = await resp.json();
                cachedGitHubUser = { token, data: userData };
                applyUserUI(userData);
            }
        } catch (e) {
            console.warn('Could not fetch GitHub user avatar:', e);
        }
    }

    function applyUserUI(userData) {
        if (!userData) return;
        if (gistAvatarImg && userData.avatar_url) {
            gistAvatarImg.src = userData.avatar_url;
            gistAvatarImg.style.display = 'block';
            if (gistStatusDot) gistStatusDot.style.display = 'none';
        }
        if (gistUsernameText && userData.login) {
            gistUsernameText.textContent = `(@${userData.login})`;
        }
    }

    async function backupToGist() {
        const token = githubTokenInput ? githubTokenInput.value.trim() : '';
        const existingGistId = gistIdInput ? gistIdInput.value.trim() : '';
        const currentLang = languageSelect ? languageSelect.value : 'tr';

        if (!token) {
            alert(getTranslation(currentLang, 'gistErrorNoToken'));
            if (githubTokenInput) githubTokenInput.focus();
            return;
        }

        const payloadData = {
            inactivityTimeValue: parseInt(inactivityTimeValueInput.value, 10) || 15,
            inactivityTimeUnit: inactivityTimeUnitSelect.value,
            disableAutoSuspension: disableAutoSuspensionCheckbox.checked,
            neverSuspendPinned: neverSuspendPinnedCheckbox.checked,
            neverSuspendActiveInWindow: neverSuspendActiveInWindowCheckbox.checked,
            neverSuspendAudio: neverSuspendAudioCheckbox.checked,
            neverSuspendOffline: neverSuspendOfflineCheckbox.checked,
            autoUnsuspendOnView: restoreTriggerSelect ? (restoreTriggerSelect.value === 'auto') : true,
            suspensionMethod: suspensionMethodSelect ? suspensionMethodSelect.value : 'page',
            restoreTrigger: restoreTriggerSelect ? restoreTriggerSelect.value : 'auto',
            unsuspendDelay: unsuspendDelaySelect ? parseInt(unsuspendDelaySelect.value, 10) || 0 : 0,
            showRamToast: showRamToastCheckbox ? showRamToastCheckbox.checked : true,
            animalTheme: animalThemeSelect ? animalThemeSelect.value : 'cat',
            addContextMenu: addContextMenuCheckbox.checked,
            excludedUrls: excludedUrlsTextarea.value,
            theme: themeSelect.value,
            language: currentLang,
            iconClickAction: iconClickActionSelect ? iconClickActionSelect.value : 'suspendOthers',
            exportedAt: new Date().toISOString(),
            app: "TabSuspender HaYTooL"
        };

        const gistPayload = {
            description: "TabSuspender HaYTooL - Cloud Settings Backup",
            public: false,
            files: {
                "tab_suspender_settings.json": {
                    content: JSON.stringify(payloadData, null, 2)
                }
            }
        };

        try {
            backupGistBtn.disabled = true;
            backupGistBtn.textContent = '⏳ ...';

            let endpoint = 'https://api.github.com/gists';
            let method = 'POST';

            if (existingGistId) {
                endpoint = `https://api.github.com/gists/${existingGistId}`;
                method = 'PATCH';
            }

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistPayload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            const newGistId = result.id;
            if (gistIdInput) gistIdInput.value = newGistId;

            // Save new gist ID and token to local storage
            chrome.storage.sync.set({ githubToken: token, gistId: newGistId }, () => {
                showStatusMessage(getTranslation(currentLang, 'gistBackupSuccess'));
            });

        } catch (err) {
            console.error('Gist Backup Error:', err);
            alert(`Gist Backup Error: ${err.message}`);
        } finally {
            backupGistBtn.disabled = false;
            updateLanguage(currentLang);
        }
    }

    async function restoreFromGist() {
        const token = githubTokenInput ? githubTokenInput.value.trim() : '';
        let gistId = gistIdInput ? gistIdInput.value.trim() : '';
        const currentLang = languageSelect ? languageSelect.value : 'tr';

        if (!gistId && !token) {
            alert(getTranslation(currentLang, 'gistErrorNoId'));
            if (gistIdInput) gistIdInput.focus();
            return;
        }

        try {
            restoreGistBtn.disabled = true;
            restoreGistBtn.textContent = '⏳ ...';

            const headers = {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Smart Auto-Discovery: If Gist ID is empty, search user's gists via GitHub API
            if (!gistId) {
                showStatusMessage(getTranslation(currentLang, 'gistSearching'));
                const listResp = await fetch('https://api.github.com/gists?per_page=50', {
                    method: 'GET',
                    headers: headers
                });

                if (!listResp.ok) {
                    const errData = await listResp.json().catch(() => ({}));
                    throw new Error(errData.message || `HTTP ${listResp.status}`);
                }

                const gists = await listResp.json();
                const matchedGist = Array.isArray(gists) && gists.find(g => 
                    g.files && (g.files["tab_suspender_settings.json"] || (g.description && g.description.includes("TabSuspender-HaYTooL-Sync")))
                );

                if (matchedGist && matchedGist.id) {
                    gistId = matchedGist.id;
                    if (gistIdInput) gistIdInput.value = gistId;
                    chrome.storage.sync.set({ gistId: gistId });
                } else {
                    alert(getTranslation(currentLang, 'gistNotFound'));
                    return;
                }
            }

            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            const targetFile = result.files && (result.files["tab_suspender_settings.json"] || Object.values(result.files)[0]);

            if (!targetFile || !targetFile.content) {
                throw new Error("No settings JSON found in this Gist.");
            }

            const parsed = JSON.parse(targetFile.content);
            applyImportedSettings(parsed);
            showStatusMessage(getTranslation(currentLang, 'gistRestoreSuccess'));

        } catch (err) {
            console.error('Gist Restore Error:', err);
            alert(`Gist Restore Error: ${err.message}`);
        } finally {
            restoreGistBtn.disabled = false;
            updateLanguage(currentLang);
        }
    }

    function exportToFile() {
        const currentLang = languageSelect ? languageSelect.value : 'tr';
        const data = {
            inactivityTimeValue: parseInt(inactivityTimeValueInput.value, 10) || 15,
            inactivityTimeUnit: inactivityTimeUnitSelect.value,
            disableAutoSuspension: disableAutoSuspensionCheckbox.checked,
            neverSuspendPinned: neverSuspendPinnedCheckbox.checked,
            neverSuspendActiveInWindow: neverSuspendActiveInWindowCheckbox.checked,
            neverSuspendAudio: neverSuspendAudioCheckbox.checked,
            neverSuspendOffline: neverSuspendOfflineCheckbox.checked,
            autoUnsuspendOnView: restoreTriggerSelect ? (restoreTriggerSelect.value === 'auto') : true,
            suspensionMethod: suspensionMethodSelect ? suspensionMethodSelect.value : 'page',
            restoreTrigger: restoreTriggerSelect ? restoreTriggerSelect.value : 'auto',
            unsuspendDelay: unsuspendDelaySelect ? parseInt(unsuspendDelaySelect.value, 10) || 0 : 0,
            showRamToast: showRamToastCheckbox ? showRamToastCheckbox.checked : true,
            animalTheme: animalThemeSelect ? animalThemeSelect.value : 'cat',
            addContextMenu: addContextMenuCheckbox.checked,
            excludedUrls: excludedUrlsTextarea.value,
            theme: themeSelect.value,
            language: currentLang,
            iconClickAction: iconClickActionSelect ? iconClickActionSelect.value : 'suspendOthers',
            exportedAt: new Date().toISOString(),
            app: "TabSuspender HaYTooL"
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TabSuspender-Settings-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importFromFile(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                applyImportedSettings(parsed);
                showStatusMessage('✓ ' + getTranslation(languageSelect ? languageSelect.value : 'tr', 'settingsSaved'));
            } catch (err) {
                alert('Invalid JSON file: ' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    }

    function applyImportedSettings(data) {
        if (!data || typeof data !== 'object') return;

        const newSettings = {};
        if (typeof data.inactivityTimeValue === 'number') newSettings.inactivityTimeValue = data.inactivityTimeValue;
        if (typeof data.inactivityTimeUnit === 'string') newSettings.inactivityTimeUnit = data.inactivityTimeUnit;
        if (typeof data.disableAutoSuspension === 'boolean') newSettings.disableAutoSuspension = data.disableAutoSuspension;
        if (typeof data.neverSuspendPinned === 'boolean') newSettings.neverSuspendPinned = data.neverSuspendPinned;
        if (typeof data.neverSuspendActiveInWindow === 'boolean') newSettings.neverSuspendActiveInWindow = data.neverSuspendActiveInWindow;
        if (typeof data.neverSuspendAudio === 'boolean') newSettings.neverSuspendAudio = data.neverSuspendAudio;
        if (typeof data.neverSuspendOffline === 'boolean') newSettings.neverSuspendOffline = data.neverSuspendOffline;
        if (typeof data.autoUnsuspendOnView === 'boolean') newSettings.autoUnsuspendOnView = data.autoUnsuspendOnView;
        if (typeof data.suspensionMethod === 'string') newSettings.suspensionMethod = data.suspensionMethod;
        if (typeof data.restoreTrigger === 'string') newSettings.restoreTrigger = data.restoreTrigger;
        if (typeof data.unsuspendDelay === 'number') newSettings.unsuspendDelay = data.unsuspendDelay;
        if (typeof data.showRamToast === 'boolean') newSettings.showRamToast = data.showRamToast;
        if (typeof data.animalTheme === 'string') newSettings.animalTheme = data.animalTheme;
        if (typeof data.addContextMenu === 'boolean') newSettings.addContextMenu = data.addContextMenu;
        if (typeof data.excludedUrls === 'string') newSettings.excludedUrls = data.excludedUrls;
        if (typeof data.theme === 'string') newSettings.theme = data.theme;
        if (typeof data.language === 'string') newSettings.language = data.language;
        if (typeof data.iconClickAction === 'string') newSettings.iconClickAction = data.iconClickAction;

        chrome.storage.sync.set(newSettings, () => {
            loadSettings();
            chrome.runtime.sendMessage({ action: "loadSettingsRequest" });
        });
    }

    // Fetch all user Gists and display formatted dates/times in dropdown
    async function listBackups() {
        const token = githubTokenInput ? githubTokenInput.value.trim() : '';
        const currentLang = languageSelect ? languageSelect.value : 'tr';

        if (!token) {
            alert(getTranslation(currentLang, 'gistErrorNoToken'));
            if (githubTokenInput) githubTokenInput.focus();
            return;
        }

        try {
            listGistsBtn.disabled = true;
            listGistsBtn.textContent = '⏳ ...';
            if (backupSelectorContainer) backupSelectorContainer.style.display = 'block';
            if (backupSelect) {
                backupSelect.innerHTML = `<option value="">${getTranslation(currentLang, 'backupListLoading')}</option>`;
            }

            const response = await fetch('https://api.github.com/gists?per_page=100', {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `HTTP ${response.status}`);
            }

            const gists = await response.json();
            const backups = (Array.isArray(gists) ? gists : []).filter(g => 
                g.files && (g.files["tab_suspender_settings.json"] || (g.description && g.description.includes("TabSuspender-HaYTooL-Sync")))
            );

            if (backups.length === 0) {
                if (backupSelect) {
                    backupSelect.innerHTML = `<option value="">${getTranslation(currentLang, 'backupListEmpty')}</option>`;
                }
                alert(getTranslation(currentLang, 'backupListEmpty'));
                return;
            }

            if (backupSelect) {
                backupSelect.innerHTML = '';
                backups.forEach((b, idx) => {
                    const opt = document.createElement('option');
                    opt.value = b.id;
                    const dateObj = new Date(b.updated_at || b.created_at);
                    const formattedDate = dateObj.toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    opt.textContent = `${idx === 0 ? '⭐ (En Güncel) ' : ''}📅 ${formattedDate} [ID: ${b.id.substring(0, 8)}...]`;
                    backupSelect.appendChild(opt);
                });
            }

        } catch (err) {
            console.error('List Backups Error:', err);
            alert(`GitHub Error: ${err.message}`);
            if (backupSelectorContainer) backupSelectorContainer.style.display = 'none';
        } finally {
            listGistsBtn.disabled = false;
            updateLanguage(currentLang);
        }
    }

    // Apply specific backup chosen from dropdown
    async function applySelectedBackup() {
        const selectedId = backupSelect ? backupSelect.value : '';
        if (!selectedId) return;

        if (gistIdInput) gistIdInput.value = selectedId;
        chrome.storage.sync.set({ gistId: selectedId });
        await restoreFromGist();
    }

    // Gist & File Listeners
    if (backupGistBtn) backupGistBtn.addEventListener('click', backupToGist);
    if (restoreGistBtn) restoreGistBtn.addEventListener('click', restoreFromGist);
    if (listGistsBtn) listGistsBtn.addEventListener('click', listBackups);
    if (applySelectedBackupBtn) applySelectedBackupBtn.addEventListener('click', applySelectedBackup);
    if (cancelBackupSelectBtn) cancelBackupSelectBtn.addEventListener('click', () => {
        if (backupSelectorContainer) backupSelectorContainer.style.display = 'none';
    });

    // GitHub Logout / Disconnect Listener
    if (gistLogoutBtn) {
        gistLogoutBtn.addEventListener('click', () => {
            const currentLang = languageSelect ? languageSelect.value : 'tr';
            if (confirm(getTranslation(currentLang, 'gistLogoutConfirm'))) {
                cachedGitHubUser = null;
                if (githubTokenInput) githubTokenInput.value = '';
                if (gistIdInput) gistIdInput.value = '';
                if (gistAvatarImg) {
                    gistAvatarImg.src = '';
                    gistAvatarImg.style.display = 'none';
                }
                if (gistStatusDot) gistStatusDot.style.display = 'inline';
                if (gistUsernameText) gistUsernameText.textContent = '';
                chrome.storage.sync.set({ githubToken: '', gistId: '' }, () => {
                    updateLanguage(currentLang);
                    showStatusMessage(getTranslation(currentLang, 'gistLoggedOutSuccess'));
                });
            }
        });
    }

    if (exportFileBtn) exportFileBtn.addEventListener('click', exportToFile);
    if (importFileBtn) importFileBtn.addEventListener('click', () => importFileInput && importFileInput.click());
    if (importFileInput) importFileInput.addEventListener('change', importFromFile);

    // Load initial settings
    loadSettings();
});
