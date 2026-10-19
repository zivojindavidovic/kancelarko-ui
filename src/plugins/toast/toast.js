import { toast } from "vue3-toastify";
import { h } from "vue";
import DOMPurify from "dompurify";

import birthdayIcon from '../../icons/circle-icons/birthday.svg';
import eDelovodnikIcon from '../../icons/circle-icons/e-postar.svg';
import eInvoiceIcon from '../../icons/circle-icons/e-invoice.svg';
import holidayRequestIcon from '../../icons/circle-icons/holiday-request.svg';
import infoIcon from '../../icons/circle-icons/info.svg';
import invoiceIcon from '../../icons/circle-icons/invoice.svg';
import kadrovikIcon from '../../icons/circle-icons/kadrovik.svg';
import privilegeIcon from '../../icons/circle-icons/privilegije.svg';
import slavaIcon from '../../icons/circle-icons/slava.svg';
import workingHoursIcon from '../../icons/circle-icons/working-hours.svg';
import notificationIcon from '../../icons/notification-active.svg';

const CIRCLE_ICON_MAP = {
    'circle-icons/birthday': birthdayIcon,
    'circle-icons/contract-expiring': kadrovikIcon,
    'circle-icons/e-delovodnik': eDelovodnikIcon,
    'circle-icons/e-invoice': eInvoiceIcon,
    'circle-icons/e-postar': eDelovodnikIcon,
    'circle-icons/holiday-request': holidayRequestIcon,
    'circle-icons/info': infoIcon,
    'circle-icons/invoice': invoiceIcon,
    'circle-icons/jubilej': birthdayIcon,
    'circle-icons/kadrovik': kadrovikIcon,
    'circle-icons/privilegije': privilegeIcon,
    'circle-icons/slava': slavaIcon,
    'circle-icons/working-hours': workingHoursIcon,
};

const DEFAULT_TOAST_OPTIONS = {
    autoClose: 3000,
    theme: "dark",
    position: "top-right",
    closeOnClick: false,
    dangerouslyHTMLString: true,
};

const defaultNotifyObject = {
    title: {
        text: "",
        isLink: false,
        url: "#",
    },
    body: "",
    icon: null,
    autoClose: 3000,
};

const DEFAULT_HTML_PAYLOAD = {
    titleHtml: "",
    bodyHtml: "",
    icon: null,
    autoClose: 3000,
};

export const customToast = {
    getNotifyObject() {
        return {
            ...defaultNotifyObject,
            title: {
                ...defaultNotifyObject.title,
            },
        };
    },

    show(payload, options = {}) {
        if (typeof payload === "string") {
            return this.html({
                bodyHtml: escapeText(payload),
                autoClose: options.autoClose,
            }, options);
        }

        return this.notification(payload, options);
    },

    showToast(payload, options = {}) {
        return this.show(payload, options);
    },

    notification(payload = {}, options = {}) {
        const notifyObject = normalizeNotificationPayload(payload);
        const titleHtml = buildTitleHtml(notifyObject.title);

        return this.html({
            titleHtml,
            bodyHtml: sanitizeToastHtml(notifyObject.body),
            icon: notifyObject.icon,
            autoClose: notifyObject.autoClose,
        }, options);
    },

    html(payload = {}, options = {}) {
        const htmlPayload = normalizeHtmlPayload(payload);
        const html = buildToastHtml(htmlPayload);

        return toast(html, {
            ...DEFAULT_TOAST_OPTIONS,
            ...options,
            autoClose: htmlPayload.autoClose,
            icon: () => renderToastIcon(htmlPayload.icon),
        });
    },

    info(message, options = {}) {
        return toast.info(escapeText(message), {
            ...DEFAULT_TOAST_OPTIONS,
            ...options,
            dangerouslyHTMLString: false,
        });
    },

    success(message, options = {}) {
        return toast.success(escapeText(message), {
            ...DEFAULT_TOAST_OPTIONS,
            ...options,
            dangerouslyHTMLString: false,
        });
    },

    warning(message, options = {}) {
        return toast.warning(escapeText(message), {
            ...DEFAULT_TOAST_OPTIONS,
            ...options,
            dangerouslyHTMLString: false,
        });
    },

    error(message, options = {}) {
        return toast.error(escapeText(message), {
            ...DEFAULT_TOAST_OPTIONS,
            ...options,
            dangerouslyHTMLString: false,
        });
    },
};

function normalizeNotificationPayload(payload = {}) {
    const notifyObject = {
        ...defaultNotifyObject,
        ...payload,
        title: {
            ...defaultNotifyObject.title,
            ...(payload?.title || {}),
        },
    };

    const titleText = notifyObject.title.text
        || payload?.notificationTitle
        || payload?.titleText
        || 'Nova notifikacija';

    const body = payload?.body
        ?? payload?.textHtml
        ?? payload?.notificationText
        ?? payload?.textSrbLat
        ?? payload?.textSrbCir
        ?? payload?.textEng
        ?? '';

    return {
        ...notifyObject,
        title: {
            ...notifyObject.title,
            text: truncateText(titleText, 80),
        },
        body,
        icon: resolveToastIcon(payload?.icon ?? notifyObject.icon),
        autoClose: Number(notifyObject.autoClose) > 0 ? Number(notifyObject.autoClose) : defaultNotifyObject.autoClose,
    };
}

function normalizeHtmlPayload(payload = {}) {
    const htmlPayload = {
        ...DEFAULT_HTML_PAYLOAD,
        ...payload,
    };

    return {
        ...htmlPayload,
        titleHtml: sanitizeToastHtml(htmlPayload.titleHtml),
        bodyHtml: sanitizeToastHtml(htmlPayload.bodyHtml),
        icon: resolveToastIcon(htmlPayload.icon),
        autoClose: Number(htmlPayload.autoClose) > 0 ? Number(htmlPayload.autoClose) : DEFAULT_HTML_PAYLOAD.autoClose,
    };
}

function buildTitleHtml(title) {
    const titleText = escapeText(title?.text ?? '');

    if (titleText === '') {
        return '';
    }

    if (title?.isLink === true) {
        const href = safeHref(title?.url);

        return `<a href="${href}" class="toast-title toast-link" target="_blank" rel="noopener noreferrer">${titleText}</a>`;
    }

    return `<div class="toast-title">${titleText}</div>`;
}

function buildToastHtml(payload) {
    const titleHtml = payload.titleHtml
        ? payload.titleHtml.includes('toast-title')
            ? payload.titleHtml
            : `<div class="toast-title">${payload.titleHtml}</div>`
        : '';
    const bodyHtml = payload.bodyHtml
        ? `<div class="toast-body">${payload.bodyHtml}</div>`
        : '';

    return `${titleHtml}${bodyHtml}`;
}

function renderToastIcon(icon) {
    if (!icon) {
        return null;
    }

    return h("img", {
        src: icon,
        width: 36,
        height: 36,
        alt: "",
    });
}

function normalizeIconName(name) {
    return String(name ?? '')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/_/g, '-')
        .toLowerCase();
}

function resolveToastIcon(icon) {
    if (!icon) {
        return null;
    }

    // stari nazivi iz backenda (circle_icons/...) -> kebab-case
    if (typeof icon === 'string' && !icon.startsWith('<') && !icon.startsWith('data:') && !/^(https?:)?\//.test(icon)) {
        icon = normalizeIconName(icon);
    }

    if (CIRCLE_ICON_MAP[icon]) {
        return CIRCLE_ICON_MAP[icon];
    }

    switch (icon) {
        case 'obligation':
            return invoiceIcon;
        case 'circle-icons/actions':
            return invoiceIcon;
        case 'folder':
            return eDelovodnikIcon;
        case 'circle-icons/e-invoice':
            return eInvoiceIcon;
        case 'circle-icons/holiday-request':
            return holidayRequestIcon;
        case 'circle-icons/pdf':
            return infoIcon;
        case 'circle-icons/working-hours':
            return workingHoursIcon;
        case 'time':
            return kadrovikIcon;
        case 'notification-active':
            return notificationIcon;
        default:
            return String(icon);
    }
}

function truncateText(text, maxLength) {
    const plainText = DOMPurify
        .sanitize(String(text ?? ""), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
        .replace(/\s+/g, " ")
        .trim();

    if (plainText.length <= maxLength) {
        return plainText;
    }

    return `${plainText.slice(0, maxLength - 3).trim()}...`;
}

function escapeText(text) {
    return DOMPurify.sanitize(String(text ?? ""), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
}

function sanitizeToastHtml(html) {
    const sanitizedHtml = DOMPurify.sanitize(String(html ?? ""), {
        ALLOWED_TAGS: ["p", "br", "b", "strong", "i", "em", "ul", "ol", "li", "span", "a"],
        ALLOWED_ATTR: ["class", "href", "title", "target", "rel"],
    });

    return normalizeToastLinks(sanitizedHtml);
}

function normalizeToastLinks(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    wrapper.querySelectorAll('a').forEach(link => {
        const safeUrl = safeHref(link.getAttribute('href'));

        link.setAttribute('href', safeUrl);

        if (safeUrl !== '#') {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        } else {
            link.removeAttribute('target');
            link.removeAttribute('rel');
        }
    });

    return wrapper.innerHTML;
}

function safeHref(url) {
    try {
        if (!url) {
            return '#';
        }

        if (url.startsWith('/')) {
            return url;
        }

        const parsedUrl = new URL(url, window.location.origin);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            return parsedUrl.toString();
        }

        return '#';
    } catch {
        return '#';
    }
}

/* validation - zadrzano zbog stare strukture, iako se trenutno ne koristi */
function validateNotifyObject(notify) {
    let notifyObject = {
        ...defaultNotifyObject,
        title: {
            ...defaultNotifyObject.title,
        },
    };

    if (notify?.hasOwnProperty('title')) {
        notifyObject.title = notify.title;
    }

    return notifyObject;
}
