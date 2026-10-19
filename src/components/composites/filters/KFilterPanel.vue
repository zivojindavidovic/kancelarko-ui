<template>
    <div class="filter-panel mb-4">

        <!-- Glavni slot za sav sadržaj filtera -->
        <slot :filters="localFilters"></slot>

        <!-- ACTION BUTTONS -->
        <div class="row mt-3 justify-content-end">
            <slot 
                name="actions"
                :onApply="onApply"
                :onCancel="onCancel"
                :onReset="onReset"
                :filters="localFilters"
            >
                <!-- DEFAULT (fallback) -->
                <div class="col-md-3 col-lg-2 col-xxl-2 col-12" v-if="showReset">
                <button
                    
                    class="btn btn-outline-primary border-0 btn-sm w-100"
                    @click="onReset"
                >
                    {{ returnLocale('resetuj') }}
                </button>
                </div>

                <div class="col-md-3 col-lg-3 col-xxl-2 col-12 mt-3 mt-md-0" v-if="showCancel">
                <button
                    
                    class="btn btn-outline-primary btn-sm w-100"
                    @click="onCancel"
                >
                    {{ returnLocale('odustani') }}
                </button>
                </div>

                <div class="col-md-3 col-lg-3 col-xxl-2 col-12 mt-3 mt-md-0" v-if="showApply">
                <button
                    
                    class="btn btn-primary btn-sm w-100"
                    @click="onApply"
                >
                    {{ returnLocale('potvrdi') }}
                </button>
                </div>
            </slot>
        </div>
    </div>
</template>

<script>
import LocaleMixin from '../../../helpers/locale-mixin';

export default {
    name: 'KFilterPanel',
    mixins: [LocaleMixin],

    props: {
        modelValue: {
            type: Object,
            required: true
        },
        showReset: {
            type: Boolean,
            default: true
        },
        showCancel: {
            type: Boolean,
            default: true
        },
        showApply: {
            type: Boolean,
            default: true
        }
    },

    emits: [
        "update:modelValue",
        "apply",
        "reset",
        "cancel"
    ],

    created() {
        this.setDefaultLocale({
            resetuj: 'Resetuj',
            odustani: 'Odustani',
            potvrdi: 'Potvrdi',
            ...(this.$parent?.generalLocale || this.generalLocale || {})
        });
    },

    data() {
        return {
            localFilters: this.cloneFilters(this.modelValue)
        };
    },

    watch: {
        modelValue: {
            deep: true,
            handler(newVal) {
                this.localFilters = this.cloneFilters(newVal);
            }
        }
    },

    methods: {
        onApply() {
            const cloned = this.cloneFilters(this.localFilters);

            this.$emit("update:modelValue", cloned);
            this.$emit("apply", cloned);
        },

        onCancel() {
            this.localFilters = this.cloneFilters(this.modelValue);
            this.$emit("cancel");
        },

        onReset() {
            this.$emit("reset");
        },

        // Univerzalna metoda za duboko kloniranje koja čuva Date objekte
        cloneFilters(obj) {
            if (obj === null || typeof obj !== 'object') return obj;

            // Zadržavamo Date instancu
            if (obj instanceof Date) {
                return new Date(obj.getTime());
            }

            // Ako je niz, kloniramo svaki element (bitno za statuse/tagove)
            if (Array.isArray(obj)) {
                return obj.map(item => this.cloneFilters(item));
            }

            // Ako je objekat, rekurzivno kloniramo sve ključeve
            const cloned = {};
                Object.keys(obj).forEach(key => {
                    cloned[key] = this.cloneFilters(obj[key]);
                });
            return cloned;
        },
    }
};
</script>