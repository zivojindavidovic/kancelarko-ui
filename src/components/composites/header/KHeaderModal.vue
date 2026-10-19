<template>
    <Teleport to="body" :disabled="!teleport">
        <div
            :id="id"
            class="header-modal"
            :class="[sizeClass, { 'menu-modal': menu }, modalClass]"
            @click.stop
            @pointerdown.stop
        >
            <div class="header-modal-wrapper">
                <!-- HEADER -->
                <div v-if="title || $slots.header" class="header-modal-header">
                    <slot name="header">
                        <span class="header-modal-title">{{ title }}</span>
                    </slot>
                </div>

                <!-- MAIN -->
                <div class="header-modal-main">
                    <!-- tabovi / akcije (.header-menu) -->
                    <div v-if="$slots.menu" class="header-menu">
                        <slot name="menu" />
                    </div>

                    <div v-if="wrapContent" class="header-content" :class="contentClass">
                        <slot />
                    </div>

                    <slot v-else />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
/**
 * Generički header modal (notifikacije, poslednji dokumenti, nalog...).
 * Otvara se pozivom KHeader.triggerModal(triggerEl, id) ili kroz
 * `modalId` na header akciji. Pozicionira se ispod elementa koji ga je otvorio.
 */
export default {
    name: 'KHeaderModal',

    props: {
        id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            default: ''
        },
        /* sm = max-width-300, md = max-width-350, lg = default (500px) */
        size: {
            type: String,
            default: 'lg',
            validator: (v) => ['sm', 'md', 'lg'].includes(v)
        },
        /* varijanta sa podmenijima (kao "Moj nalog") */
        menu: {
            type: Boolean,
            default: false
        },
        /* default slot se umotava u .header-content; false = sam kontrolises markup */
        wrapContent: {
            type: Boolean,
            default: true
        },
        contentClass: {
            type: [String, Array, Object],
            default: ''
        },
        modalClass: {
            type: [String, Array, Object],
            default: ''
        },
        teleport: {
            type: Boolean,
            default: true
        },
    },

    computed: {
        sizeClass() {
            if (this.size === 'sm') return 'max-width-300';
            if (this.size === 'md') return 'max-width-350';

            return '';
        }
    }
}
</script>
