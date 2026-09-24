import { Logger } from '../core/Logger.js';

/**
 * TabSuspender HaYTooL - Layer 2: Business Logic Layer
 * ContextMenuService manages browser context menu registration and click routing.
 */
export class ContextMenuService {
    /**
     * Recreates context menu items according to user settings and language.
     * @param {Object} settings 
     * @param {Function} translateFn 
     */
    static updateContextMenu(settings, translateFn) {
        chrome.contextMenus.removeAll(() => {
            if (chrome.runtime.lastError) {
                Logger.warn('ContextMenuService', 'Error removing context menus:', chrome.runtime.lastError);
            }

            const lang = settings.language || 'tr';
            const t = (k) => typeof translateFn === 'function' ? translateFn(lang, k) : k;

            // 1. Action context menu items (Eklenti simgesine sağ tıklandığında gösterilir)
            try {
                chrome.contextMenus.create({
                    id: "openOfficialWebsite",
                    title: t('contextOfficialSite') || '🌐 Resmi Web Sitesi',
                    contexts: ["action"]
                });
                chrome.contextMenus.create({
                    id: "openHaytoolPortal",
                    title: t('contextPortal') || '🏠 HaYTooL PoRTaL',
                    contexts: ["action"]
                });
            } catch (err) {
                Logger.warn('ContextMenuService', 'Error creating action context menus:', err);
            }

            // 2. Page context menu items (Web sayfasında sağ tıklandığında gösterilir)
            if (settings.addContextMenu) {
                try {
                    chrome.contextMenus.create({
                        id: "suspendCurrentTab",
                        title: t('contextSuspendTab') || 'Sekmeyi Askıya Al',
                        contexts: ["page"]
                    });
                    chrome.contextMenus.create({
                        id: "whitelistThisSite",
                        title: t('contextWhitelistSite') || 'Bu Siteyi Hariç Tut',
                        contexts: ["page"]
                    });
                } catch (err) {
                    Logger.warn('ContextMenuService', 'Error creating page context menus:', err);
                }
            }
        });
    }

    /**
     * Routes context menu click events.
     * @param {chrome.contextMenus.OnClickData} info 
     * @param {chrome.tabs.Tab} tab 
     * @param {Object} actions { onSuspendCurrent: Function, onWhitelistSite: Function }
     */
    static handleClick(info, tab, actions) {
        if (!info) return;

        // Action context menu clicks (Toolbar ikonu sağ tık)
        if (info.menuItemId === "openOfficialWebsite") {
            chrome.tabs.create({ url: "https://haytokoraz.github.io/TabSuspender-HaYTooL/" });
            return;
        }
        if (info.menuItemId === "openHaytoolPortal") {
            chrome.tabs.create({ url: "https://haytokoraz.github.io/" });
            return;
        }

        // Page context menu clicks (Sayfa içi sağ tık)
        if (tab) {
            if (info.menuItemId === "suspendCurrentTab" && actions && actions.onSuspendCurrent) {
                actions.onSuspendCurrent(tab);
            } else if (info.menuItemId === "whitelistThisSite" && actions && actions.onWhitelistSite) {
                actions.onWhitelistSite(tab);
            }
        }
    }
}
