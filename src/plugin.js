import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';

import ToastPlugin from './plugins/toast/plugin';
import AlertPlugin from './plugins/alert/plugin';
import * as components from './components';
import { setTheme, initTheme } from './helpers/theme';

/**
 * Stari App* nazivi -> novi K* nazivi. Registruju se samo uz opciju `legacyNames: true`,
 * da bi starije stranice radile bez prepravki (<AppSelect> / <app-select>).
 */
export const LEGACY_NAMES = {
    AppIcon: 'KIcon',
    AppTextInput: 'KTextInput',
    AppTextarea: 'KTextarea',
    AppNumberInput: 'KNumberInput',
    AppCheckbox: 'KCheckbox',
    AppRadio: 'KRadio',
    AppSwitch: 'KSwitch',
    AppSelect: 'KSelect',
    AppSelectAsync: 'KSelectAsync',
    AppDatePicker: 'KDatePicker',
    AppTextEditor: 'KTextEditor',
    AppTooltip: 'KTooltip',
    AppAvatar: 'KAvatar',
    AppInfoBox: 'KInfoBox',
    AppPagination: 'KPagination',
    AppContextMenu: 'KContextMenu',
    AppDataCard: 'KDataCard',
    AppDataTableWrapper: 'KDataTable',
    AppDataTablePrint: 'KDataTablePrint',
    AppFilterPanel: 'KFilterPanel',
    AppFilterPreview: 'KFilterPreview',
    AppCalendar: 'KCalendar',
    CalendarEvent: 'KCalendarEvent',
    AppTree: 'KTree',
    AppTreeNode: 'KTreeNode',
    AppFileUpload: 'KFileUpload',
    AppDocumentUpload: 'KDocumentUpload',
    AppDocumentUploadMulti: 'KDocumentUploadMulti',
    AppEmployeeSelect: 'KEmployeeSelect',
    AppEmployeeInfoCard: 'KEmployeeCard',
    AppSidebar: 'KSidebar',
    AppSidebarItem: 'KSidebarItem',
    AppSidebarChildItem: 'KSidebarChildItem',
    AppHeader: 'KHeader',
    AppHeaderModal: 'KHeaderModal',
    AppHeaderNotificationRow: 'KNotificationRow',
    AppLayout: 'KLayout',
    AppPageSection: 'KPageSection'
};

/**
 * app.use(KancelarkoUI, {
 *   components: true,        // globalna registracija svih komponenti (<KTextInput> / <k-text-input>)
 *   legacyNames: false,      // registruj i stare App* nazive kao alias (<AppTextInput> / <app-text-input>)
 *   toastify: {},            // opcije za vue3-toastify
 *   floatingVue: {},         // opcije za floating-vue
 *   theme: 'dark' | 'light', // odmah postavi temu (data-theme na <html>)
 *   persistTheme: false,     // procitaj/sacuvaj temu u localStorage
 *   themeTarget: undefined,  // element ili selektor na kome zivi data-theme (default <html>)
 * })
 */
export default {
    install(app, options = {}) {
        const {
            components: registerComponents = true,
            legacyNames = false,
            toastify = {},
            floatingVue = {},
            theme = null,
            persistTheme = false,
            themeTarget = undefined,
        } = options;

        // KIcon je uvek globalna (<k-icon>), koriste je sve komponente
        app.component('KIcon', components.KIcon);

        if (registerComponents) {
            Object.entries(components).forEach(([name, component]) => {
                if (name === 'KIcon') return;

                app.component(name, component);
            });
        }

        if (legacyNames) {
            Object.entries(LEGACY_NAMES).forEach(([oldName, newName]) => {
                if (components[newName] && (registerComponents || newName === 'KIcon')) {
                    app.component(oldName, components[newName]);
                }
            });
        }

        app.use(Vue3Toastify, toastify);
        app.use(ToastPlugin);
        app.use(FloatingVue, floatingVue);
        app.use(AlertPlugin);

        if (theme) {
            setTheme(theme, { target: themeTarget, persist: persistTheme });
        } else if (persistTheme) {
            initTheme({ target: themeTarget, persist: true });
        }
    }
};
