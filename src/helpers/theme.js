/**
 * Tema se kontroliše atributom data-theme ("dark" | "light").
 *
 * SCSS deklariše sve CSS varijable pod:
 *   :root, :root[data-theme="dark"], [data-theme="dark"]   -> dark (default)
 *   :root[data-theme="light"], [data-theme="light"]        -> light
 *
 * Atribut može da stoji na <html>, na <body> ili na bilo kom wrapper elementu,
 * pa je dovoljno promeniti ga na jednom mestu da bi ceo UI promenio temu.
 */
export const THEMES = ['dark', 'light'];
export const DEFAULT_THEME = 'dark';
export const THEME_STORAGE_KEY = 'kancelarko-ui:theme';
export const THEME_CHANGE_EVENT = 'kancelarko-ui:theme-change';

function resolveTarget(target) {
    if (typeof document === 'undefined') return null;
    if (!target) return document.documentElement;
    if (typeof target === 'string') return document.querySelector(target);
    return target;
}

/**
 * Tema koja važi za dati element: najbliži predak sa data-theme atributom
 * (ili <html> ako element nije prosleđen). Koristi se za stvari koje zavise od teme
 * a ne mogu preko CSS-a (logo, TinyMCE sadržaj...).
 */
export function resolveThemeFor(element) {
    if (typeof document === 'undefined') return DEFAULT_THEME;

    const scoped = element && typeof element.closest === 'function'
        ? element.closest('[data-theme]')
        : null;
    const el = scoped
        || (document.body?.hasAttribute('data-theme') ? document.body : document.documentElement);
    const value = el?.getAttribute('data-theme');

    return THEMES.includes(value) ? value : DEFAULT_THEME;
}

export function getTheme(target) {
    const el = resolveTarget(target);
    const value = el?.getAttribute('data-theme');

    return THEMES.includes(value) ? value : DEFAULT_THEME;
}

export function setTheme(theme, { target, persist = false, storageKey = THEME_STORAGE_KEY } = {}) {
    const el = resolveTarget(target);
    const next = THEMES.includes(theme) ? theme : DEFAULT_THEME;

    if (!el) return next;

    el.setAttribute('data-theme', next);

    if (persist) {
        try {
            window.localStorage.setItem(storageKey, next);
        } catch (e) {
            /* storage nije dostupan - ignorisi */
        }
    }

    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme: next, target: el } }));

    return next;
}

export function toggleTheme(options = {}) {
    const current = getTheme(options.target);

    return setTheme(current === 'dark' ? 'light' : 'dark', options);
}

/**
 * Poziva se jednom na startu aplikacije: čita sačuvanu temu (ako je persist uključen)
 * i postavlja data-theme atribut. Ako ništa nije sačuvano koristi `fallback`.
 */
export function initTheme({ target, fallback = DEFAULT_THEME, persist = true, storageKey = THEME_STORAGE_KEY } = {}) {
    let stored = null;

    if (persist) {
        try {
            stored = window.localStorage.getItem(storageKey);
        } catch (e) {
            stored = null;
        }
    }

    const el = resolveTarget(target);
    const existing = el?.getAttribute('data-theme');
    const theme = THEMES.includes(stored) ? stored : (THEMES.includes(existing) ? existing : fallback);

    return setTheme(theme, { target, persist: false });
}

export function onThemeChange(callback) {
    const handler = (event) => callback(event.detail.theme, event.detail.target);

    window.addEventListener(THEME_CHANGE_EVENT, handler);

    return () => window.removeEventListener(THEME_CHANGE_EVENT, handler);
}
