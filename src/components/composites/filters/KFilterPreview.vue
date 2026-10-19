<template>
    <div class="filter-preview" v-if="hasActiveFilters">
        <div class="filter-preview__header d-flex justify-content-between align-items-center">
            <div class="filter-preview__title">
                {{ returnLocale('rezultatFiltera') }}
            </div>
            <div class="filter-preview__actions d-flex align-items-center pe-4">
                <div @click="isExpanded = !isExpanded" class="filter-preview__icon d-flex">
                    <Icon 
                        :name="isExpanded ? 'cant-view' : 'view'" 
                        wrapperClass="k-icon icon-sm" 
                    />
                </div>
                <span class="filter-preview__clearButton" @click="$emit('clear-all')">
                    {{ returnLocale('obrisiSve') }}
                </span>
            </div>
        </div>

        <div v-show="isExpanded">
            <div class="filter-preview__list d-flex flex-column mt-4">
                <div v-for="(value, key) in activeFilters" :key="key"
                    class="filter-preview__item d-flex justify-content-between align-items-end">
    
                    <div class="filter-preview__item-content d-flex flex-column">
                        <div class="filter-preview__item-title">
                            {{ getLabel(key) }}
                        </div>
    
                        <div class="filter-preview__values d-flex flex-wrap gap-2">
                            <!-- MULTISELECT: Renderujemo niz pilova -->
                            <template v-if="Array.isArray(value)">
                                <span v-for="(item, index) in value" :key="index"
                                    class="pill bg-filter has-icon"
                                >
                                    <div class="pill-wrapper b-small-font">
                                        {{ formatDisplayValue(item, key) }}
                                        <div class="pill-icon cursor-pointer">
                                            <Icon name="close" @click="removeSingleValue(key, item)"
                                                wrapperClass="k-icon icon-sm filter-preview__value-icon" />
                                        </div>
                                    </div>
                                </span>
                            </template>
    
                            <!-- CHECKBOX: Prikazujemo samo jedan pil ako je true -->
                            <template v-else-if="typeof value === 'boolean'">
                                <span v-if="value" class="pill bg-filter has-icon">
                                    <div class="pill-wrapper b-small-font">
                                        {{ returnLocale('da') }}
                                        <div class="pill-icon cursor-pointer">
                                            <Icon name="close" @click="removeFilter(key)"
                                                wrapperClass="k-icon icon-sm filter-preview__value-icon" />
                                        </div>
                                    </div>
                                </span>
                            </template>
    
                            <!-- SINGLE SELECT, RADIO, DATE: Jedan pil -->
                            <template v-else>
                                <span class="pill bg-filter has-icon">
                                    <div class="pill-wrapper b-small-font">
                                        {{ formatDisplayValue(value, key) }}
                                        <div class="pill-icon cursor-pointer">
                                            <Icon name="close" @click="removeFilter(key)"
                                                wrapperClass="k-icon icon-sm filter-preview__value-icon" />
                                        </div>
                                    </div>
                                </span>
                            </template>
                        </div>
                    </div>
    
                    <div class="filter-preview__item-actions">
                        <button class="btn btn-outline-primary border-0 btn-sm" @click="removeFilter(key)">
                            {{ returnLocale('obrisiSve') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import Icon from '../../atoms/icon/KIcon.vue';
import LocaleMixin from '../../../helpers/locale-mixin';

export default {
    name: "KFilterPreview",

    mixins: [LocaleMixin],

    components: {
        Icon
    },

    created() {
        const defaultLocale = typeof this.defaultLocale === 'string'
            ? {}
            : (this.defaultLocale || {});

        const parentDefaultLocale = typeof this.$parent?.defaultLocale === 'string'
            ? {}
            : (this.$parent?.defaultLocale || {});

        const currentGeneralLocale = typeof this.generalLocale === 'string'
            ? {}
            : (this.generalLocale || {});

        const parentGeneralLocale = typeof this.$parent?.generalLocale === 'string'
            ? {}
            : (this.$parent?.generalLocale || {});

        this.setDefaultLocale({
            rezultatFiltera: 'Rezultat filtera',
            obrisiSve: 'Obrisi sve',
            da: 'Da',
            ...parentDefaultLocale,
            ...defaultLocale,
            ...parentGeneralLocale,
            ...currentGeneralLocale,
        });
    },

    data() {
        return {
            isExpanded: true
        }
    },

    props: {
        filters: {
            type: Object,
            required: true
        },

        labels: {
            type: Object,
            default: () => ({})
        },

        formatters: {
            type: Object,
            default: () => ({})
        }
    },

    emits: ["remove-filter", "clear-all"],

    computed: {
        activeFilters() {
            const result = {};
            Object.entries(this.filters).forEach(([key, value]) => {
                const isEmptyArray = Array.isArray(value) && value.length === 0;

                if (
                    value !== null && 
                    value !== undefined && 
                    value !== false && 
                    value !== "" && 
                    !isEmptyArray
                ) {
                    result[key] = value;
                }
            });
            return result;
        },

        hasActiveFilters() {
            return Object.keys(this.activeFilters).length > 0;
        }
    },

    methods: {
        getLabel(key) {
            return this.labels[key] || key;
        },

        formatDisplayValue(value, key = null) {
            if (!value) return '';

            const formatter = key ? this.formatters[key] : null;
            if (typeof formatter === 'function') {
                return formatter(value);
            }

            // 1. Ako je Date objekat (Date Picker)
            if (value instanceof Date) {
                return value.toLocaleDateString('sr-RS');
            }

            // 2. Ako je objekat, tražimo bilo koji poznati ključ za prikaz
            if (typeof value === 'object') {
                
                // Redosled prioriteta ključeva koji se koriste
                //NAP: Ako lista nema zeljeni kljuc za ispis liste, dodati po potrebi kljuc za ispis
                const displayKey = ['name', 'title', 'value', 'label'].find(key => key in value);
                
                return displayKey ? value[displayKey] : JSON.stringify(value);
            }

            // 3. Ako je običan string ili broj
            return value;
        },

        removeFilter(key) {
            this.$emit("remove-filter", { key });
        },

        removeSingleValue(key, item) {
            this.$emit("remove-filter", { key, item });
        }
    }
};
</script>
