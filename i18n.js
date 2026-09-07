const translations = {
    en: {
        appName: "TabSuspender HaYTooL",
        settingsTitle: "TabSuspender HaYTooL Settings",
        saveButton: "Save Settings",
        settingsSaved: "Settings saved!",
        resetButton: "Restore Defaults",
        resetSuccess: "Defaults restored!",
        resetConfirm: "Are you sure you want to reset all settings to default values?",
        
        // Sections
        sectionAutoSuspend: "Automatic Suspension",
        sectionExclusions: "Never Suspend These Tabs",
        sectionRestore: "Auto-Restore",
        sectionAppearance: "Appearance & Language",
        sectionWhitelist: "Never Suspend URLs",
        sectionShortcuts: "Keyboard Shortcuts",
        sectionAbout: "About & Links",
        
        // Auto Suspend
        disableAutoSuspension: "Disable automatic suspension",
        suspendAfterLabel: "Automatically suspend tabs after:",
        sec: "seconds",
        min: "minutes",
        hours: "hours",
        
        // Exclusions
        neverSuspendPinned: "Pinned tabs",
        neverSuspendActive: "The active tab in each window",
        neverSuspendAudio: "Tabs playing audio",
        neverSuspendOffline: "Tabs when offline",
        
        // Auto Restore
        autoUnsuspendOnView: "Automatically unsuspend tab when it is viewed",
        
        // Appearance & Integration
        iconClickActionLabel: "When extension icon is clicked:",
        iconClickSuspendOthers: "Suspend all other tabs (Except current)",
        iconClickPopup: "Open popup menu",
        themeLabel: "Theme:",
        themeLight: "Light",
        themeDark: "Dark",
        themeDiscord: "Discord (Blurple & Dark)",
        themeYouTube: "YouTube (OLED Black & Red)",
        themeMatrix: "Matrix (Hacker Green & Dark)",
        languageLabel: "Language / Dil:",
        addContextMenu: "Add \"Suspend Tab\" to right-click menu",
        
        // Whitelist
        whitelistHint: "Supports * as a wildcard (e.g. *.reddit.com/* or mail.google.com). One per line.",
        whitelistPlaceholder: "e.g., https://mail.google.com or *.reddit.com/*",
        
        // Shortcuts
        shortcutsDesc: "Chrome extensions manage shortcuts through Chrome's dedicated shortcut manager for security.",
        shortcutsBtn: "Open Chrome Shortcuts Page",
        shortcutsNote: "Find \"TabSuspender HaYTooL\" and click the edit pencil icon to assign keys.",
        
        // Cloud & GitHub Gist
        sectionGist: "Cloud & GitHub Gist Sync",
        gistDesc: "Sync your settings and whitelist across different browsers (Chrome, Edge, Helium, Brave, etc.) via GitHub Gist.",
        githubTokenLabel: "GitHub Personal Access Token (PAT):",
        githubTokenPlaceholder: "ghp_xxxxxxxxxxxxxxxxxxxx (Needs 'gist' permission)",
        gistIdLabel: "Gist ID (Optional for first backup):",
        gistIdPlaceholder: "Auto-filled after first backup or paste existing Gist ID",
        btnBackupGist: "Upload to Gist",
        btnRestoreGist: "Restore from Gist",
        btnListGists: "Browse Backups",
        selectBackupPrompt: "Select a Backup to Restore:",
        backupListLoading: "Loading backups from GitHub...",
        backupListEmpty: "No TabSuspender backups found on your GitHub account.",
        gistConnected: "GitHub Connected",
        gistLogoutBtn: "Log Out / Disconnect",
        gistLogoutConfirm: "Are you sure you want to disconnect GitHub and clear your saved Token and Gist ID?",
        gistLoggedOutSuccess: "GitHub disconnected successfully.",
        gistBackupSuccess: "Settings uploaded to Gist successfully!",
        gistRestoreSuccess: "Settings restored from Gist successfully!",
        gistSearching: "Searching for backups on GitHub...",
        gistNotFound: "No TabSuspender backup found in your GitHub account.",
        gistErrorNoToken: "Please enter a valid GitHub Token with 'gist' scope.",
        gistErrorNoId: "Please provide a Gist ID or enter your Token to browse backups.",
        gistHelpLink: "Create Token on GitHub (Auto-named with Date)",
        btnExportFile: "Export JSON File",
        btnImportFile: "Import JSON File",
        
        // About
        developer: "by HaYTo",
        officialSite: "Official Web Site",
        portal: "HaYTooL PoRTaL",
        githubRepo: "GitHub Repo",
        supportFeedback: "Developer Support & Feedback:",
        
        // Popup
        loadingTabs: "Loading tabs...",
        noTabs: "No tabs open in this window.",
        suspendAll: "Suspend All",
        suspendOthers: "Suspend Others",
        unsuspendAll: "Unsuspend All",
        unsuspendInBackground: "Unsuspend in background",
        suspendBtn: "Suspend",
        unsuspendBtn: "Unsuspend",
        currentTabMarker: "(Current)",
        
        // Suspended Page
        tabSuspendedTitle: "Tab Suspended!",
        tabSuspendedDesc: "This tab was suspended to save system memory.",
        restoreHint: "Click anywhere to restore this tab.",
        restoreHintClickOnly: "Click anywhere on the screen to restore this tab.",
        whitelistBtn: "Never Suspend This Site",
        untitledTab: "Untitled Tab",
        
        // Context Menus
        contextSuspendTab: "Suspend This Tab",
        contextWhitelistSite: "Never Suspend This Site",

        // New Settings (v2.4)
        sectionSuspensionMethod: "Suspension Mode",
        suspensionMethodLabel: "Choose how tabs should be suspended:",
        suspensionMethodPage: "Information Page (Default - Shows title, favicon & restore button)",
        suspensionMethodDiscard: "Direct Native Sleep (No page shown - Tab sleeps silently without changing URL)",
        suspensionMethodHint: "Native mode frees RAM immediately without navigating away from the original URL.",

        restoreTriggerLabel: "Restore Trigger:",
        restoreTriggerAuto: "Automatically restore when tab is switched/viewed",
        restoreTriggerClick: "Only restore when clicked (Never restore just by viewing)",
        restoreTriggerHint: "If 'Only restore when clicked' is selected, simply viewing the tab will keep it sleeping until you click anywhere.",

        unsuspendDelayLabel: "Automatic Wake-up Delay:",
        delayInstant: "Instant (0 seconds)",
        delay1Sec: "1 second",
        delay2Sec: "2 seconds",
        delay3Sec: "3 seconds",
        delay5Sec: "5 seconds",
        unsuspendDelayHint: "Prevents accidental wake-ups when quickly cycling through tabs.",

        sectionNotifications: "Notifications & Feedback",
        showRamToastLabel: "Show RAM savings toast notification when tabs are suspended",
        showRamToastHint: "Displays a temporary notification showing estimated RAM saved.",
        ramToastSingle: "🌙 Tab suspended! ~{ram} MB RAM saved.",
        ramToastMultiple: "🌙 {count} tabs suspended! ~{ram} MB RAM saved.",

        // Animal Mascot Setting (v2.5)
        animalThemeLabel: "Sleeping Mascot / Animal:",
        animalCat: "🐱 Ginger Cat (Cozy)",
        animalCatDark: "🐈‍⬛ Black Cat & Crescent Moon",
        animalDog: "🐶 Sleeping Puppy (Loyal)",
        animalPanda: "🐼 Sleeping Panda (Zen)",
        animalKoala: "🐨 Sleeping Koala (Peaceful)",
        animalNone: "🚫 No Mascot (Minimalist)",
        animalDescCat: "Curled up peacefully on your suspended tabs, guarding your RAM.",
        animalDescCatDark: "Mystic black cat sleeping quietly under the crescent night sky.",
        animalDescDog: "Loyal puppy napping soundly until you wake the tab up.",
        animalDescPanda: "Zen panda snoozing amongst green bamboo leaves.",
        animalDescKoala: "Gentle koala resting cozily on a eucalyptus branch.",
        animalDescNone: "Clean and minimalist layout without any animal illustration.",
        animalThemeHint: "Choose the cute animal companion that rests on your suspended tabs.",

        // Informative Suspended Page Details
        suspendedMemorySavedBadge: "Memory Saved: ~120 MB",
        suspendedSinceText: "Sleeping peacefully to keep your browser fast.",
        restoreTabButton: "Wake Up Tab",

        // Popup Tooltips & Info
        unsuspendInBackgroundTooltip: "If checked, restoring a tab will load it silently in the background without switching away from your current tab."
    },
    tr: {
        appName: "TabSuspender HaYTooL",
        settingsTitle: "TabSuspender HaYTooL Ayarları",
        saveButton: "Ayarları Kaydet",
        settingsSaved: "Ayarlar başarıyla kaydedildi!",
        resetButton: "Varsayılan Ayarlara Dön",
        resetSuccess: "Varsayılan ayarlar yüklendi!",
        resetConfirm: "Tüm ayarları varsayılan değerlerine sıfırlamak istediğinizden emin misiniz?",
        
        // Sections
        sectionAutoSuspend: "Otomatik Askıya Alma (Uyutma)",
        sectionExclusions: "Asla Askıya Alınmayacak Sekmeler",
        sectionRestore: "Otomatik Uyandırma (Geri Yükleme)",
        sectionAppearance: "Görünüm, Entegrasyon ve Dil",
        sectionWhitelist: "Asla Uyutulmayacak Siteler (Beyaz Liste)",
        sectionShortcuts: "Klavye Kısayolları",
        sectionAbout: "Hakkında ve Bağlantılar",
        
        // Auto Suspend
        disableAutoSuspension: "Otomatik uyutmayı tamamen devre dışı bırak",
        suspendAfterLabel: "Sekmeleri şu süre boşta kalınca uyut:",
        sec: "saniye",
        min: "dakika",
        hours: "saat",
        
        // Exclusions
        neverSuspendPinned: "Sabitlenmiş sekmeler (Pinned)",
        neverSuspendActive: "Her penceredeki aktif (ön plandaki) sekme",
        neverSuspendAudio: "Ses çalan sekmeler (Müzik / Video)",
        neverSuspendOffline: "İnternet bağlantısı yokken (Çevrimdışı)",
        
        // Auto Restore
        autoUnsuspendOnView: "Sekmeye tıklandığında / bakıldığında otomatik uyandır",
        
        // Appearance & Integration
        iconClickActionLabel: "Eklenti simgesine tıklandığında yapılacak işlem:",
        iconClickSuspendOthers: "Diğer tüm sekmeleri hemen uyut (Aktif sekme hariç)",
        iconClickPopup: "Açılır menüyü (Popup) göster",
        themeLabel: "Tema:",
        themeLight: "Açık Tema (Light)",
        themeDark: "Koyu Tema (Dark)",
        themeDiscord: "Discord (Blurple Moru & Koyu)",
        themeYouTube: "YouTube (OLED Siyahı & Kırmızı)",
        themeMatrix: "Matrix (Hacker Yeşili & Terminal)",
        languageLabel: "Dil / Language:",
        addContextMenu: "Sağ tık menüsüne \"Bu Sekmeyi Uyut\" seçeneğini ekle",
        
        // Whitelist
        whitelistHint: "Her satıra bir adres yazın. * joker karakterini destekler (örn: *.reddit.com/* veya mail.google.com).",
        whitelistPlaceholder: "örn: https://mail.google.com veya *.reddit.com/*",
        
        // Shortcuts
        shortcutsDesc: "Tarayıcı güvenliği nedeniyle kısayol tuşları Chrome'un özel kısayol yönetim sayfasından atanır.",
        shortcutsBtn: "Chrome Kısayollar Sayfasını Aç",
        shortcutsNote: "\"TabSuspender HaYTooL\" eklentisini bulup kalem simgesine tıklayarak istediğiniz tuşları atayın.",
        
        // Cloud & GitHub Gist
        sectionGist: "Bulut & GitHub Gist Eşitlemesi",
        gistDesc: "Farklı tarayıcılar (Chrome, Edge, Helium, Brave vb.) arasında ayarlarınızı ve beyaz listenizi GitHub Gist üzerinden tek tıkla eşitleyin.",
        githubTokenLabel: "GitHub Kişisel Erişim Belirteci (Token):",
        githubTokenPlaceholder: "ghp_xxxxxxxxxxxxxxxxxxxx ('gist' izni gerekir)",
        gistIdLabel: "Gist Kimliği (Gist ID - İlk yedeklemede boş kalabilir):",
        gistIdPlaceholder: "İlk yedeklemede otomatik üretilir veya var olanı yapıştırın",
        btnBackupGist: "Gist'e Yükle (Yedek Al)",
        btnRestoreGist: "Gist'ten İndir (Geri Yükle)",
        btnListGists: "📋 Yedek Geçmişini Gör & Seç",
        selectBackupPrompt: "Geri yüklenecek yedeği seçin:",
        backupListLoading: "GitHub'daki yedekleriniz taranıyor...",
        backupListEmpty: "GitHub hesabınızda kayıtlı bir TabSuspender yedeği bulunamadı.",
        gistConnected: "GitHub Bağlantısı Aktif",
        gistLogoutBtn: "Çıkış Yap / Bağlantıyı Kes",
        gistLogoutConfirm: "GitHub bağlantısını kesmek ve kayıtlı Token / Gist ID'yi temizlemek istediğinizden emin misiniz?",
        gistLoggedOutSuccess: "GitHub oturumu başarıyla kapatıldı.",
        gistBackupSuccess: "Ayarlar ve Beyaz Liste GitHub Gist'e başarıyla yüklendi!",
        gistRestoreSuccess: "Ayarlar ve Beyaz Liste Gist'ten başarıyla geri yüklendi!",
        gistSearching: "GitHub'daki yedekler taranıyor...",
        gistNotFound: "GitHub hesabınızda kayıtlı bir TabSuspender yedeği bulunamadı.",
        gistErrorNoToken: "Lütfen 'gist' yetkisine sahip geçerli bir GitHub Token girin.",
        gistErrorNoId: "Lütfen bir Gist ID girin ya da yedekleri listelemek için Token'ınızı yazın.",
        gistHelpLink: "GitHub Token oluştur (Tarihli otomatik isimle)",
        btnExportFile: "JSON Dosyası İndir",
        btnImportFile: "JSON Dosyası Yükle",
        
        // About
        developer: "by HaYTo",
        officialSite: "Resmi Web Sitesi",
        portal: "HaYTooL PoRTaL",
        githubRepo: "GitHub Deposu",
        supportFeedback: "Destek ve Geri Bildirim:",
        
        // Popup
        loadingTabs: "Sekmeler taranıyor...",
        noTabs: "Bu pencerede açık sekme bulunamadı.",
        suspendAll: "Tümünü Uyut",
        suspendOthers: "Diğerlerini Uyut",
        unsuspendAll: "Tümünü Uyandır",
        unsuspendInBackground: "Sekmeyi arka planda uyandır",
        suspendBtn: "Uyut",
        unsuspendBtn: "Uyandır",
        currentTabMarker: "(Aktif)",
        
        // Suspended Page
        tabSuspendedTitle: "Sekme Uyku Modunda!",
        tabSuspendedDesc: "Bu sekme bellek (RAM) tasarrufu sağlamak için askıya alındı.",
        restoreHint: "Sekmeyi uyandırmak için sayfada herhangi bir yere tıklayın.",
        restoreHintClickOnly: "Sekmeyi uyandırmak için ekranda herhangi bir yere tıklayın.",
        whitelistBtn: "Bu Siteyi Asla Uyutma",
        untitledTab: "Başlıksız Sekme",
        
        // Context Menus
        contextSuspendTab: "Bu Sekmeyi Uyut",
        contextWhitelistSite: "Bu Siteyi Asla Uyutma",

        // Yeni Ayarlar (v2.4)
        sectionSuspensionMethod: "Askıya Alma Yöntemi (Uyutma Modu)",
        suspensionMethodLabel: "Sekmeler nasıl uyutulsun:",
        suspensionMethodPage: "Görsel Bilgi Sayfası Göster (Varsayılan - Başlık, ikon ve buton içerir)",
        suspensionMethodDiscard: "Sayfa Göstermeden Doğrudan Uyut (Native Discard - URL değişmeden sessizce uyutur)",
        suspensionMethodHint: "Doğrudan uyutma modu, sekmeyi özel sayfaya yönlendirmeden tarayıcı seviyesinde dondurur ve RAM'i anında boşaltır.",

        restoreTriggerLabel: "Uyandırma Tetikleyicisi:",
        restoreTriggerAuto: "Sekmeye geçildiğinde / tıklandığında otomatik uyandır",
        restoreTriggerClick: "Yalnızca sayfaya tıklandığında uyandır (Sekmeye bakılsa bile uyanmasın)",
        restoreTriggerHint: "'Yalnızca sayfaya tıklandığında' seçilirse, sekmeye geçseniz bile ekranda bir yere tıklayana kadar sekme uykuda kalır.",

        unsuspendDelayLabel: "Otomatik Uyandırma Gecikmesi:",
        delayInstant: "Anında (0 saniye)",
        delay1Sec: "1 saniye",
        delay2Sec: "2 saniye",
        delay3Sec: "3 saniye",
        delay5Sec: "5 saniye",
        unsuspendDelayHint: "Sekmeler arasında hızlıca gezinirken sekmelerin yanlışlıkla açılmasını engeller.",

        sectionNotifications: "Bildirimler ve Geri Bildirim",
        showRamToastLabel: "Sekmeler uyutulduğunda RAM kazancı bildirimini göster",
        showRamToastHint: "Sekme uyutulduğunda ekranda tahmini kazanılan RAM miktarını belirten şık bir bildirim gösterir.",
        ramToastSingle: "🌙 Sekme uyutuldu! ~{ram} MB RAM tasarrufu sağlandı.",
        ramToastMultiple: "🌙 {count} sekme uyutuldu! ~{ram} MB RAM tasarrufu sağlandı.",

        animalThemeLabel: "Uyuyan Hayvan Maskotu:",
        animalCat: "🐱 Sarı Tekir Kedi (Sıcak & Rahat)",
        animalCatDark: "🐈‍⬛ Kara Kedi & Hilal Ay",
        animalDog: "🐶 Uyuyan Köpekçik (Sadık)",
        animalPanda: "🐼 Uyuyan Panda (Huzurlu Bambu)",
        animalKoala: "🐨 Uyuyan Koala (Ağaç Dalı)",
        animalNone: "🚫 Maskotsuz (Sade & Minimal)",
        animalDescCat: "Askıya alınan sekmelerde huzurla kıvrılıp uyuyarak RAM tasarrufunuzu izler.",
        animalDescCatDark: "Gece hilalinin altında sessizce uyuyan gizemli ve şık kara kedi.",
        animalDescDog: "Siz sekmeyi geri yükleyene kadar mışıl mışıl uyuyan sadık dostunuz.",
        animalDescPanda: "Yeşil bambuların arasında huzur ve dinginlikle uyuyan sevimli panda.",
        animalDescKoala: "Okaliptüs dalına sarılıp tatlı rüyalara dalan sakin koala.",
        animalDescNone: "Hiçbir hayvan görseli olmadan son derece sade ve minimal görünüm.",
        animalThemeHint: "Askıya alınan sekmelerde gösterilecek sevimli uyuyan hayvan arkadaşınızı seçin.",

        // Bilgilendirici Askıya Alma Sayfası Detayları
        suspendedMemorySavedBadge: "Kazanılan Bellek: ~120 MB",
        suspendedSinceText: "Tarayıcınızın hızını ve gücünü korumak için huzurla uyuyor.",
        restoreTabButton: "Sekmeyi Şimdi Uyandır",

        // Popup Tooltips & Info
        unsuspendInBackgroundTooltip: "İşaretliyse, uyuyan bir sekmeyi uyandırdığınızda bulunduğunuz sayfadan ayrılmazsınız; seçilen sekme arka planda sessizce yüklenir."
    }
};

function getTranslation(lang, key) {
    const activeLang = translations[lang] ? lang : 'tr';
    return translations[activeLang][key] || (translations['en'][key] || key);
}

// Export for service worker/window contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, getTranslation };
}
