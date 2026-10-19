<template>
    <KSelect
        :model-value="modelValue"
        :options="options"
        :mode="mode"
        :label="computedLabel"
        :track-by="computedTrackBy"
        :value-prop="valueProp"
        :object="object"
        :searchable="searchable"
        :placeholder="placeholder"
        :floating-label="floatingLabel"
        :disabled="disabled"
        :can-clear="canClear"
        :clear-on-search="clearOnSearch"
        :close-on-select="closeOnSelectComputed"
        :limit="limit"
        :hide-selected="hideSelected"
        :no-options-text="noOptionsText"
        :no-results-text="noResultsText"
        :error="error"
        :classes="classes"
        @update:modelValue="$emit('update:modelValue', $event)"
        @change="$emit('change', $event)"
        @search-change="$emit('search-change', $event)"
        @open="$emit('open')"
        @close="$emit('close')"
        @clear="$emit('clear')"
        @select="$emit('select', $event)"
        @deselect="$emit('deselect', $event)"
    >
        <template #option="{ option, isSelected }">
            <slot
                name="option"
                :option="option"
                :isSelected="isSelected"
            >
                <div class="app-employee-option">
                    <div class="app-employee-option__avatar-wrap">
                        <img
                            v-if="option[avatarField]"
                            :src="option[avatarField]"
                            :alt="getFullName(option)"
                            class="app-employee-option__avatar"
                        >

                        <div
                            v-else
                            class="app-employee-option__avatar app-employee-option__avatar--fallback"
                        >
                            {{ getInitials(option) }}
                        </div>
                    </div>

                    <div class="app-employee-option__content">
                        <div class="app-employee-option__name">
                            {{ getFullName(option) }}
                        </div>

                        <div class="app-employee-option__email">
                            {{ option[emailField] }}
                        </div>
                    </div>
                </div>
            </slot>
        </template>

        <template #singlelabel="{ value }">
            <slot name="singlelabel" :value="value">
                <div class="app-employee-single" v-if="value">
                    <div class="app-employee-single__avatar-wrap">
                        <img
                            v-if="value[avatarField]"
                            :src="value[avatarField]"
                            :alt="getFullName(value)"
                            class="app-employee-single__avatar"
                        >

                        <div
                            v-else
                            class="app-employee-single__avatar app-employee-single__avatar--fallback"
                        >
                            {{ getInitials(value) }}
                        </div>
                    </div>

                    <div class="app-employee-single__content">
                        <div class="app-employee-single__name">
                            {{ getFullName(value) }}
                        </div>

                        <div class="app-employee-single__email">
                            {{ value[emailField] }}
                        </div>
                    </div>
                </div>
            </slot>
        </template>

        <template #tag="{ option, handleTagRemove, disabled }">
            <slot
                name="tag"
                :option="option"
                :handleTagRemove="handleTagRemove"
                :disabled="disabled"
            >
                <div class="app-employee-tag">
                    <div class="app-employee-tag-info-wrap">
                        <div class="app-employee-tag__name">
                            {{ getFullName(option) }}
                        </div>

                        <div class="app-employee-tag__email">
                            {{ option[emailField] }}
                        </div>
                    </div>
                    <button
                        v-if="!disabled"
                        type="button"
                        class="app-employee-tag__remove"
                        @mousedown.prevent="handleTagRemove(option, $event)"
                        aria-label="Ukloni"
                    >
                        <k-icon name="close" wrapperClass="icon-sm" />
                    </button>
                </div>
            </slot>
        </template>
    </KSelect>
</template>

<script>
import KSelect from '../../atoms/select/KSelect.vue'

export default {
    name: 'KEmployeeSelect',

    components: {
        KSelect
    },

    props: {
        modelValue: { default: null },
        options: { type: Array, default: () => [] },

        mode: {
            type: String,
            default: 'single'
        },

        valueProp: {
            type: String,
            default: 'id'
        },

        object: {
            type: Boolean,
            default: true
        },

        searchable: {
            type: Boolean,
            default: true
        },

        placeholder: {
            type: String,
            default: ''
        },

        floatingLabel: {
            type: String,
            default: ''
        },

        disabled: {
            type: Boolean,
            default: false
        },

        canClear: {
            type: Boolean,
            default: true
        },

        clearOnSearch: {
            type: Boolean,
            default: false
        },

        closeOnSelect: {
            type: Boolean,
            default: null
        },

        limit: {
            type: Number,
            default: -1
        },

        hideSelected: {
            type: Boolean,
            default: true
        },

        noOptionsText: {
            type: String,
            default: 'Nema zaposlenih.'
        },

        noResultsText: {
            type: String,
            default: 'Nema rezultata.'
        },

        error: {
            type: [String, Boolean],
            default: ''
        },

        classes: {
            type: Object,
            default: null
        },

        firstNameField: {
            type: String,
            default: 'first_name'
        },

        lastNameField: {
            type: String,
            default: 'last_name'
        },

        emailField: {
            type: String,
            default: 'email'
        },

        avatarField: {
            type: String,
            default: 'avatar'
        },

        trackBy: {
            type: [String, Array],
            default: null
        },

        label: {
            type: String,
            default: ''
        }
    },

    emits: [
        'update:modelValue',
        'change',
        'search-change',
        'open',
        'close',
        'clear',
        'select',
        'deselect'
    ],

    computed: {
        computedTrackBy() {
            if (this.trackBy) {
                return this.trackBy
            }

            return [
                this.firstNameField,
                this.lastNameField,
                this.emailField
            ]
        },

        computedLabel() {
            if (this.label) {
                return this.label
            }

            return this.firstNameField
        },

        closeOnSelectComputed() {
            if (typeof this.closeOnSelect === 'boolean') {
                return this.closeOnSelect
            }

            return this.mode === 'tags' ? false : true
        }
    },

    methods: {
        getFullName(employee) {
            const firstName = employee?.[this.firstNameField] ?? ''
            const lastName = employee?.[this.lastNameField] ?? ''

            return `${firstName} ${lastName}`.trim()
        },

        getInitials(employee) {
            const firstName = employee?.[this.firstNameField]?.charAt(0) ?? ''
            const lastName = employee?.[this.lastNameField]?.charAt(0) ?? ''

            return `${firstName}${lastName}`.toUpperCase()
        }
    }
}
</script>
