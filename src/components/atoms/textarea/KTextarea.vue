<template>
    <div class="input-group input-group-icon-right floating-label" :class="{'validation-error': hasError}">
        <textarea
            ref="ta"
            rows="1"
            v-bind="$attrs"
            class="form-control"
            :class="{ 'validation-error': hasError }"
            :id="computedId"
            :value="normalizedValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :style="textareaStyle"
            @input="onInput"
        ></textarea>

        <label v-if="label" class="form-label" :for="computedId">
        {{ label }}
        </label>

        <!-- Wrapper uvek postoji zbog bordure/layout-a -->
        <span class="input-group-icon cursor-pointer">
            <!-- Ikonica samo kad ima vrednost -->
            <template v-if="showClearIcon">
                <k-icon
                name="close"
                wrapperClass="icon-sm"
                @click="onClearClick"
                />
            </template>
        </span>

        <!-- Validation feedback -->
        <div v-if="hasError" class="form-control-feedback">
            <span class="icon-sm me-1">
                <k-icon name="info" wrapperClass="icon-sm me-1" />
            </span>
            <span>{{ error }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'KTextarea',
    inheritAttrs: false,

    props: {
        modelValue: { type: [String, Number], default: '' },
        id: { type: String, default: null },
        label: { type: String, default: '' },

        error: { type: String, default: '' },

        disabled: Boolean,
        readonly: Boolean,

        /**
         * Max visina u px do koje textarea raste,
         * posle toga dobija scroll.
         * (ekvivalent data-autoresize-max)
         */
        autoresizeMax: { type: Number, default: 220 },

        /**
         * placeholder mora ostati '' da floating label radi
         * kroz :placeholder-shown (ako koristite tu logiku i za textarea).
         */
        placeholder: { type: String, default: '' },

        autoresizeMin: { type: Number, default: 48 },
    },

    emits: ['update:modelValue', 'clear'],

    data() {
        return {
            offset: 0,
            observedWidth: 0,
            resizeObserver: null,
            textareaStyle: {
                height: '40px',
                overflowY: 'hidden',
                boxSizing: 'border-box',
            },
        };
  },

    computed: {
        computedId() {
            return this.id || `app-textarea-${Math.random().toString(36).slice(2, 9)}`;
        },
        normalizedValue() {
            return this.modelValue ?? '';
        },
        hasValue() {
            return String(this.normalizedValue).length > 0;
        },
        hasError() {
            return !!this.error;
        },
        showClearIcon() {
            return this.hasValue && !this.disabled && !this.readonly;
        },
    },

    mounted() {
        const el = this.$refs.ta;
        if (!el) return;

        // offset kao u tvojoj funkciji: offsetHeight - clientHeight
        this.offset = el.offsetHeight - el.clientHeight;

        // inicijalno podešavanje (npr. kad ima pre-filled vrednost)
        this.resizeTextarea();

        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(([entry]) => {
                const width = entry?.contentRect?.width ?? 0;

                if (!width || width === this.observedWidth) {
                    return;
                }

                this.observedWidth = width;
                this.resizeTextarea(el);
            });
            this.resizeObserver.observe(el);
        }
    },

    beforeUnmount() {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
    },

    watch: {
        // ako se modelValue menja spolja (npr. reset forme), prilagodi visinu
        modelValue() {
            this.$nextTick(() => this.resizeTextarea());
        },
    },

    methods: {
        onInput(e) {
            this.$emit('update:modelValue', e.target.value);
            this.resizeTextarea(e.target);
        },

        onClearClick(e) {
            e.preventDefault();
            e.stopPropagation();

            this.$emit('update:modelValue', '');
            this.$emit('clear');

            // nakon clear-a resetuj visinu na default (autoresize)
            this.$nextTick(() => this.resizeTextarea());
        },

        resizeTextarea(passedEl) {
            const el = passedEl || this.$refs.ta;
            if (!el) return;

            if (el.offsetHeight && el.clientHeight) {
                this.offset = el.offsetHeight - el.clientHeight;
            }

            const maxHeight = this.autoresizeMax ? Number(this.autoresizeMax) : null;
            const minHeight = this.autoresizeMin ? Number(this.autoresizeMin) : 0;

            el.style.height = 'auto';
            // -3 -> visina se preracuna u 51px, sto je za 3px vise (border + padding + line-height rounding textarea-e)
            let targetHeight = el.scrollHeight + this.offset - 3;

            // obezbedi minimalnu visinu (kao input)
            if (minHeight && targetHeight < minHeight) {
                targetHeight = minHeight;
            }

            if (maxHeight && targetHeight > maxHeight) {
                this.textareaStyle.height = maxHeight + 'px';
                this.textareaStyle.overflowY = 'auto';
            } else {
                this.textareaStyle.height = targetHeight + 'px';
                this.textareaStyle.overflowY = 'hidden';
            }

            el.style.height = this.textareaStyle.height;
            el.style.overflowY = this.textareaStyle.overflowY;
        }
    },
};
</script>
