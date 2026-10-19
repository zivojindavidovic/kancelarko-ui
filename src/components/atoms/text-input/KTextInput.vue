<template>
    <div 
        class="input-group input-group-icon-right floating-label" 
        :class="{
            'validation-error': hasError || highlightError,
            'validation-success': hasSuccess,
            'lighter-bg': lightBackground
        }"
    >
        <input
            v-bind="$attrs"
            :id="computedId"
            :value="normalizedValue"
            placeholder=""
            :disabled="disabled"
            :readonly="readonly"
            class="form-control"
            :class="{
                'validation-error': hasError || highlightError,
                'validation-success': hasSuccess
            }"
            @keydown="onKeydown"
            @input="onInput"
        />

        <label v-if="label" class="form-label" :for="computedId">
            {{ label }}
        </label>

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
        <div v-if="hasFeedback" class="form-control-feedback">
            <span class="icon-sm me-1">
                <k-icon v-if="hasError" name="info" wrapperClass="icon-sm me-1" />  
                <k-icon v-if="hasSuccess" name="waiting-approval" wrapperClass="icon-sm me-1" />
            </span>
            <span>{{ showMessage }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'KTextInput',
    inheritAttrs: false,

    props: {
        modelValue: { type: [String, Number], default: '' },
        id: { type: String, default: null },
        label: { type: String, default: '' },

        error: { type: String, default: '' },
        highlightError: { type: Boolean, default: false },
        success: { type: String, default: '' },

        disabled: Boolean,
        readonly: Boolean,
        digitsOnly: Boolean,
        phoneCharactersOnly: Boolean,
        //ako zelimo da bude svetilija pozadina (default = $dark-gray, lighterbg - $gray)
        lightBackground: Boolean
    },

    emits: ['update:modelValue', 'clear'],

    computed: {
        computedId() {
            return this.id || `app-input-${Math.random().toString(36).slice(2, 9)}`;
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
        hasSuccess() {
            return !!this.success;
        },
        hasFeedback() {
            return this.hasError || this.hasSuccess;
        },
        showMessage() {
            if (this.hasError) {
                return this.error;
            }

            if (this.hasSuccess) {
                return this.success;
            }

            return '';
        },
        showClearIcon() {
            // Uvek clearable, ali prikaz samo kad ima vrednost i nije disabled/readonly
            return this.hasValue && !this.disabled && !this.readonly;
        },
    },

    methods: {
        onKeydown(e) {
            let allowedCharacterPattern = null;

            if (this.digitsOnly) {
                allowedCharacterPattern = /^\d$/;
            } else if (this.phoneCharactersOnly) {
                allowedCharacterPattern = /^[0-9\/+*#()\-]$/;
            }

            if (
                allowedCharacterPattern
                && !e.ctrlKey
                && !e.metaKey
                && !e.altKey
                && e.key.length === 1
                && !allowedCharacterPattern.test(e.key)
            ) {
                e.preventDefault();
            }
        },
        onInput(e) {
            let value = e.target.value;

            if (this.digitsOnly) {
                value = value.replace(/\D/g, '');
            } else if (this.phoneCharactersOnly) {
                value = value.replace(/[^0-9\/+*#()\-]/g, '');
            }

            if (e.target.value !== value) {
                e.target.value = value;
            }

            this.$emit('update:modelValue', value);
        },
        onClearClick(e) {
            e.preventDefault();
            e.stopPropagation();

            this.$emit('update:modelValue', '');
            this.$emit('clear');
        },
    },
};
</script>
