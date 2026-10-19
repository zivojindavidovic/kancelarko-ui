<template>
    <div
        class="input-group input-group-icon-right floating-label"
        :class="{
            'validation-error': hasError,
            'validation-success': hasSuccess,
            'lighter-bg': lightBackground
        }"
    >
        <input
            v-bind="$attrs"
            :id="computedId"
            :value="displayValue"
            type="number"
            placeholder=""
            :disabled="disabled"
            :readonly="readonly"
            class="form-control"
            :class="{
                'validation-error': hasError,
                'validation-success': hasSuccess
            }"
            @input="onInput"
        />
            <!-- @input="onInput" -->
        <label v-if="label" class="form-label" :for="computedId">
            {{ label }}
        </label>

        <span class="input-group-icon number-input-controls">
            <button
                type="button"
                class="btn btn-sm number-input-control number-input-control-up"
                :disabled="disabled || readonly"
                @mousedown="startHold('stepUp')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
            >
                <k-icon name="colapse" wrapperClass="icon-sm"/>
            </button>

            <button
                type="button"
                class="btn btn-sm number-input-control number-input-control-down"
                :disabled="disabled || readonly"
                @mousedown="startHold('stepDown')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
            >
                <k-icon name="expand" wrapperClass="icon-sm"/>
            </button>
        </span>

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
    name: 'KNumberInput',
    inheritAttrs: false,

    props: {
        modelValue: { type: [String, Number], default: '' },
        id: { type: String, default: null },
        label: { type: String, default: '' },

        error: { type: String, default: '' },
        success: { type: String, default: '' },

        disabled: Boolean,
        readonly: Boolean,
        lightBackground: Boolean,

        step: {
            type: Number,
            default: 1,
        },
        min: {
            type: Number,
            default: null,
        },
        max: {
            type: Number,
            default: null,
        },
    },

    emits: ['update:modelValue'],

    data() {
        return {
            holdInterval: null,
        };
    },

    mounted() {
        window.addEventListener('mouseup', this.stopHold);
    },

    beforeUnmount() {
        window.removeEventListener('mouseup', this.stopHold);
    },

    computed: {
        computedId() {
            return this.id || `app-number-input-${Math.random().toString(36).slice(2, 9)}`;
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
        displayValue() {
            return this.modelValue ?? '';
        },
    },

    methods: {
        onInput(e) {
            let value = e.target.value;
            
            if (value === '') {
                this.$emit('update:modelValue', '');
                return;
            }

            value = Number(value);

            if (this.min !== null && value < this.min) {
                value = this.min;
                e.target.value = value;
            }

            if (this.max !== null && value > this.max) {
                value = this.max;
                e.target.value = value;
            }

            this.$emit('update:modelValue', value);
        },

        onBlur(e) {
            if (value && value > this.max) {
                value = this.max;
            }
        },

        stepUp() {
            const currentValue = this.getNumericValue();
            let nextValue = currentValue + this.step;

            if (this.max !== null && nextValue > this.max) {
                nextValue = this.max;
            }

            this.$emit('update:modelValue', this.normalizeNumber(nextValue));
        },

        stepDown() {
            const currentValue = this.getNumericValue();
            let nextValue = currentValue - this.step;

            if (this.min !== null && nextValue < this.min) {
                nextValue = this.min;
            }

            this.$emit('update:modelValue', this.normalizeNumber(nextValue));
        },

        getNumericValue() {
            const parsed = Number(this.modelValue);

            if (this.modelValue === '' || this.modelValue === null || Number.isNaN(parsed)) {
                if (this.min !== null) {
                    return this.min;
                }

                return 0;
            }

            return parsed;
        },

        normalizeNumber(value) {
            const decimals = this.getStepDecimals(this.step);

            if (decimals === 0) {
                return value;
            }

            return Number(value.toFixed(decimals));
        },

        getStepDecimals(step) {
            const stepString = String(step);

            if (!stepString.includes('.')) {
                return 0;
            }

            return stepString.split('.')[1].length;
        },
        startHold(type) {
            // odmah jednom izvrši (instant response)
            this[type]();

            this.holdInterval = setInterval(() => {
                this[type]();
            }, 150); // brzina ponavljanja
        },

        stopHold() {
            if (this.holdInterval) {
                clearInterval(this.holdInterval);
                this.holdInterval = null;
            }
        },
    },
};
</script>

<style lang="scss">
    
</style>