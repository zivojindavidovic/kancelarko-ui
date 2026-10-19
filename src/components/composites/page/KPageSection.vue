<template>
    <div class="main-section-wrapper" :class="[{ 'section-bg-theme': themed }, wrapperClass]">
        <div v-if="hasHeader" class="main-section-header">
            <div class="main-section-header-left">
                <div v-if="icon" class="main-section-content-icon">
                    <k-icon :name="icon" :wrapperClass="['k-icon', iconSize]" />
                </div>

                <div class="main-section-content-title">
                    <slot name="header">
                        <h1 class="title-text">{{ title }}</h1>
                    </slot>
                </div>
            </div>

            <div v-if="$slots.actions" class="main-section-header-right mt-3 mt-md-0">
                <slot name="actions" />
            </div>
        </div>

        <div class="main-section" :class="sectionClass">
            <slot />
        </div>
    </div>
</template>

<script>
/**
 * Standardna sekcija stranice (naslov + ikonica + akcije desno + sadrzaj),
 * standardni Kancelarko markup (.main-section-wrapper.section-bg-theme).
 */
export default {
    name: 'KPageSection',

    props: {
        title: {
            type: String,
            default: ''
        },
        /* npr. 'icons-3d/benefits' */
        icon: {
            type: String,
            default: ''
        },
        iconSize: {
            type: String,
            default: 'icon-lg'
        },
        themed: {
            type: Boolean,
            default: true
        },
        wrapperClass: {
            type: [String, Array, Object],
            default: ''
        },
        sectionClass: {
            type: [String, Array, Object],
            default: ''
        },
    },

    computed: {
        hasHeader() {
            return !!(this.title || this.icon || this.$slots.header || this.$slots.actions);
        }
    }
}
</script>
