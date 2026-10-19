<template>
    <div class="container-fluid main-section-wrapper" :class="wrapperClass">
        <!-- sidebar -->
        <slot name="sidebar" />

        <div class="content" :class="{ 'sidebar-minimized': layoutStore.isSidebarMinimized }">
            <div class="content-wrapper">
                <!-- navbar -->
                <slot name="header" />

                <!-- body -->
                <div class="main">
                    <slot />
                </div>
            </div>
        </div>

        <slot name="footer" />
    </div>
</template>

<script>
import { layoutStore } from './layout-store';

/**
 * Osnovni layout: sidebar levo, header + sadrzaj desno.
 * Isti raspored kao u Blade layout-u Kancelarko aplikacija.
 */
export default {
    name: 'KLayout',

    props: {
        wrapperClass: {
            type: [String, Array, Object],
            default: ''
        }
    },

    data() {
        return {
            layoutStore,
        };
    },
}
</script>
