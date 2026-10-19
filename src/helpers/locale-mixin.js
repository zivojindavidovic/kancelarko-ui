function resolveLocaleProperty(source, property) {
    if (!source || typeof source !== 'object') {
        return undefined;
    }

    if (Object.prototype.hasOwnProperty.call(source, property)) {
        return source[property];
    }

    return String(property).split('.').reduce((value, key) => {
        if (!value || typeof value !== 'object') {
            return undefined;
        }

        return value[key];
    }, source);
}

export default {
    inject: {
        providedLocaleContext: {
            from: 'localeContext',
            default: null
        }
    },

    props: {
        locale: {
            type: [Object, String],
            default: ''
        },
        defaultLocale: {
            type: [Object, String],
            default: ''
        },
        defaultGeneralLocale: {
            type: [Object, String],
            default: ''
        },
        jsLocale: {
            type: [Object, String],
            default: ''
        },
        defaultJsLocale: {
            type: [Object, String],
            default: ''
        },
        generalLocale: {
            type: [Object, String],
            default: ''
        }
    },

    data() {
        return {
            localeTmp: typeof this.defaultLocale === 'string'
                ? (this.providedLocaleContext?.defaultLocale || {})
                : (this.defaultLocale || {}),
            jsLocaleTmp: typeof this.defaultJsLocale === 'string'
                ? (this.providedLocaleContext?.defaultJsLocale || {})
                : (this.defaultJsLocale || {}),
            generalLocaleTmp: typeof this.defaultGeneralLocale === 'string'
                ? (this.providedLocaleContext?.defaultGeneralLocale || {})
                : (this.defaultGeneralLocale || {})
        };
    },

    methods: {
        setDefaultLocale(defaultLocale = this.defaultLocale || {}) {
            this.localeTmp = defaultLocale || {};
        },

        setDefaultJsLocale(defaultJsLocale = this.defaultJsLocale || {}) {
            this.jsLocaleTmp = defaultJsLocale || {};
        },

        setDefaultGeneralLocale(defaultGeneralLocale = this.defaultGeneralLocale || {}) {
            this.generalLocaleTmp = defaultGeneralLocale || {};
        },

        returnLocale(property) {
            const localeSource = typeof this.locale === 'string'
                ? (this.providedLocaleContext?.locale || this.localeTmp)
                : (this.locale || {});

            return resolveLocaleProperty(localeSource, property)
                ?? resolveLocaleProperty(this.localeTmp, property)
                ?? resolveLocaleProperty(this.providedLocaleContext?.defaultLocale, property)
                ?? property;
        },

        returnJsLocale(property) {
            const localeSource = typeof this.jsLocale === 'string'
                ? (this.providedLocaleContext?.jsLocale || this.jsLocaleTmp)
                : (this.jsLocale || {});

            return resolveLocaleProperty(localeSource, property)
                ?? resolveLocaleProperty(this.jsLocaleTmp, property)
                ?? resolveLocaleProperty(this.localeTmp, property)
                ?? resolveLocaleProperty(this.providedLocaleContext?.defaultJsLocale, property)
                ?? resolveLocaleProperty(this.providedLocaleContext?.defaultLocale, property)
                ?? property;
        },

        returnGeneralLocale(property) {
            const localeSource = typeof this.generalLocale === 'string'
                ? (this.providedLocaleContext?.generalLocale || this.generalLocaleTmp)
                : (this.generalLocale || {});

            return resolveLocaleProperty(localeSource, property)
                ?? resolveLocaleProperty(this.generalLocaleTmp, property)
                ?? resolveLocaleProperty(this.localeTmp, property)
                ?? resolveLocaleProperty(this.providedLocaleContext?.defaultGeneralLocale, property)
                ?? resolveLocaleProperty(this.providedLocaleContext?.defaultLocale, property)
                ?? property;
        },

        formatLocale(property, replacements = {}) {
            let text = this.returnLocale(property);

            if (typeof text !== 'string') {
                return property;
            }

            Object.entries(replacements).forEach(([key, value]) => {
                text = text.replaceAll(`:${key}`, value);
            });

            return text;
        }
    }
};
