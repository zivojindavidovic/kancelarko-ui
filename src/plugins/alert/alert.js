import Swal from 'sweetalert2';

/**
 * 1) ICON REGISTRY (tip -> ikonica)
 * Ovde definišeš ikonice po tipu. Može biti:
 * - raw SVG string ("<svg ...>...</svg>")
 * - URL/putanja (npr. iz import-a)
 *
 * Putanje ovde ostavljam kao stub — ti ćeš posle samo popuniti realne vrednosti.
 */
import infoIcon from '../../icons/alert-icons/info.svg';
import successIcon from '../../icons/alert-icons/success.svg';
import warningIcon from '../../icons/alert-icons/warning.svg';
import errorIcon from '../../icons/alert-icons/error.svg';

const ICONS_BY_TYPE = {
    info: infoIcon,     // npr. infoIconUrl ili "<svg .../>"
    success: successIcon,
    warning: warningIcon,
    error: errorIcon,
    question: warningIcon, // confirm default
};

const CLOSE_ICON_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_3_149)"><path d="M4.00001 19.9999L20 3.99992" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M20 19.9999L4.00003 3.99992" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></g><defs><clipPath id="clip0_3_149"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>`;

/**
 * 2) Helper: napravi iconHtml (SVG string ili <img src="...">)
 */
function buildIconHtml(icon) {
    if (!icon) return undefined;

    // raw SVG markup
    if (typeof icon === 'string' && icon.trim().startsWith('<svg')) {
        return icon;
    }

    // url/path (import-ovana putanja)
    if (typeof icon === 'string') {
        return `<img src="${icon}" alt="" />`;
    }

    return undefined;
}

/**
 * 3) Default classes (Bootstrap 5 / design system)
 */
const DEFAULT_CUSTOM_CLASS = {
    popup: 'app-swal',
    title: 'app-swal__title',
    htmlContainer: 'app-swal__content',
    actions: 'app-swal__actions',
    confirmButton: 'btn btn-primary btn-sm alert-button',
    cancelButton: 'btn btn-outline-primary btn-sm me-3 alert-button',
    denyButton: 'btn btn-outline-primary btn-sm me-3 alert-button',
    closeButton: 'app-swal__close',
    icon: 'app-swal__icon',
};

function resolveContent({ text, html, allowHtml }) {
  // Default: plain text
    if (!allowHtml) {
        return {
            text: text || '',
            html: undefined,
        };
    }

    // Ako si eksplicitno dozvolio HTML
    return {
        text: undefined,
        html: html || text || '',
    };
}


function getBaseOptions(overrides = {}) {
    const customClass = {
        ...DEFAULT_CUSTOM_CLASS,
        ...(overrides.customClass || {}),
    };

    return {
        heightAuto: false,
        buttonsStyling: false,
        reverseButtons: true,
        showConfirmButton: false,
        showCloseButton: true,
        closeButtonHtml: CLOSE_ICON_SVG,
        customClass,
        ...overrides,
    };
}

/**
 * 4) Centralno: resolve ikonicu po tipu.
 * - Ako postoji custom ikonica za taj tip => koristimo iconHtml (i gasimo default icon)
 * - Ako ne postoji => fallback na SweetAlert2 built-in icon
 */
function resolveIconOptions(type) {
    const icon = ICONS_BY_TYPE[type];
    const iconHtml = buildIconHtml(icon);

    // Ako ima custom ikonica -> iconHtml, bez default icon
    if (iconHtml) {
        return { icon: undefined, iconHtml };
    }

    // Ako nema -> default swal icon
    return { icon: type, iconHtml: undefined };
}

/**
 * 5) API + opcioni setter da kasnije “registruješ” ikonice globalno.
 */
export const alert = {
    /**
     * Pozovi jednom pri boot-u aplikacije (ili kad god),
     * da registruješ ikonice po tipu.
     *
     * alert.setIcons({
     *   info: infoIconUrl,
     *   success: successIconUrl,
     *   warning: warningIconUrl,
     *   error: errorIconUrl,
     *   question: questionIconUrl
     * })
     */
    setIcons(map = {}) {
        Object.keys(map).forEach((key) => {
            if (key in ICONS_BY_TYPE) ICONS_BY_TYPE[key] = map[key];
        });
    },

    /**
     * Generic open (ne forsira tip)
     * Ako želiš i ovde “globalnu” ikonicu, prosledi options.icon ili options.iconHtml ručno.
     */
    open(options = {}) {
        return Swal.fire(getBaseOptions(options));
    },

    /**
     * Uvek koristi definisanu ikonicu za tip (ako je registrovana),
     * a ako nije, fallback na default SweetAlert2.
     */
    info(title, text, options = {}) {
        const content = resolveContent({
            text,
            html: options.html,
            allowHtml: options.allowHtml === true,
        });

        return Swal.fire(
            getBaseOptions({
                title,
                ...content,
                ...resolveIconOptions('info'),
                ...options,
            })
        );
    },

    success(title, text, options = {}) {
        const content = resolveContent({
            text,
            html: options.html,
            allowHtml: options.allowHtml === true,
        });

        return Swal.fire(
            getBaseOptions({
                title,
                ...content,
                ...resolveIconOptions('success'),
                ...options,
            })
        );
    },

    warning(title, text, options = {}) {
        const content = resolveContent({
            text,
            html: options.html,
            allowHtml: options.allowHtml === true,
        });

        return Swal.fire(
            getBaseOptions({
                title,
                ...content,
                ...resolveIconOptions('warning'),
                ...options,
            })
        );
    },

    error(title, text, options = {}) {
        const content = resolveContent({
            text,
            html: options.html,
            allowHtml: options.allowHtml === true,
        });
        
        return Swal.fire(
            getBaseOptions({
                title,
                ...content,
                ...resolveIconOptions('error'),
                ...options,
            })
        );
    },

    /**
     * Confirm modal (default "question" tip)
     */
    confirm(payload = {}, options = {}) {
        const content = resolveContent({
            text: payload.text,
            html: options.html,
            allowHtml: options.allowHtml === true,
        });

        const {
            title = 'Da li si siguran?',
            // text = '',
            confirmText = 'Potvrdi',
            cancelText = 'Otkaži',
            showCancelButton = true,
        } = payload;

        return Swal.fire(
            getBaseOptions({
                title,
                ...content,
                showConfirmButton: true,
                showCancelButton,
                confirmButtonText: confirmText,
                cancelButtonText: cancelText,
                focusCancel: true,
                ...resolveIconOptions('question'),
                ...options,
                showCloseButton: false, // ne sme da postoji X na konfirmaciji
            })
        );
    },

    close() {
        Swal.close();
    },
};
