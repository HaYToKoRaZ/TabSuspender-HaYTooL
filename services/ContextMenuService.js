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
            if (settings.addContextMenu) {
                const lang = settings.language || 'tr';
                const t = (k) => typeof translateFn === 'function' ? translateFn(lang, k) : k;

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
        if (!info || !tab) return;
        if (info.menuItemId === "suspendCurrentTab" && actions.onSuspendCurrent) {
            actions.onSuspendCurrent(tab);
        } else if (info.menuItemId === "whitelistThisSite" && actions.onWhitelistSite) {
            actions.onWhitelistSite(tab);
        }
    }
}
