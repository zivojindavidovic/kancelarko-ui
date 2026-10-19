<template>
    <div ref="trigger" :class="['context-menu-trigger', fullWidth ? 'd-block w-100' : 'd-inline-block']">
        <slot name="trigger" :toggle="toggleMenu" :open="openMenu" :close="closeMenu" :isOpen="isOpen" />
    </div>

    <teleport :to="teleportTo" :disabled="!teleport">
        <div v-if="isOpen" ref="menu" class="dropdown-menu d-block shadow" :style="menuStyle" @click.stop
            @contextmenu.prevent>
            <slot :close="closeMenu" :isOpen="isOpen" />
        </div>
    </teleport>
</template>

<script>
let activeMenuInstance = null

export default {
    name: 'KContextMenu',
    props: {
        offsetX: {
            type: Number,
            default: 0
        },
        offsetY: {
            type: Number,
            default: 6
        },
        minWidth: {
            type: [Number, String],
            default: 240
        },
        closeOnScroll: {
            type: Boolean,
            default: true
        },
        teleport: {
            type: Boolean,
            default: true
        },
        teleportTo: {
            type: String,
            default: 'body'
        },
        // Expands the trigger to its parent's width, primarily for responsive header actions.
        fullWidth: {
            type: Boolean,
            default: false
        }
    },

    emits: ['open', 'close'],

    data() {
        return {
            isOpen: false,
            position: {
                x: 0,
                y: 0
            }
        }
    },

    computed: {
        menuStyle() {
            return {
                position: 'fixed',
                left: `${this.position.x}px`,
                top: `${this.position.y}px`,
                zIndex: 1080,
                minWidth: typeof this.minWidth === 'number'
                    ? `${this.minWidth}px`
                    : this.minWidth
            }
        }
    },

    mounted() {
        document.addEventListener('click', this.handleOutsideClick)
        document.addEventListener('keydown', this.handleEscape)
        window.addEventListener('resize', this.handleViewportChange)
        window.addEventListener('scroll', this.handleScroll, true)
    },

    beforeUnmount() {
        document.removeEventListener('click', this.handleOutsideClick)
        document.removeEventListener('keydown', this.handleEscape)
        window.removeEventListener('resize', this.handleViewportChange)
        window.removeEventListener('scroll', this.handleScroll, true)

        if (activeMenuInstance === this) {
            activeMenuInstance = null
        }
    },

    methods: {
        openMenu() {
            if (this.isOpen) return

            if (activeMenuInstance && activeMenuInstance !== this) {
                activeMenuInstance.closeMenu()
            }

            activeMenuInstance = this

            this.isOpen = true
            this.$emit('open')

            this.$nextTick(() => {
                this.updatePosition()
            })
        },

        closeMenu() {
            if (!this.isOpen) return

            this.isOpen = false

            if (activeMenuInstance === this) {
                activeMenuInstance = null
            }

            this.$emit('close')
        },

        toggleMenu() {
            if (this.isOpen) {
                this.closeMenu()
            } else {
                this.openMenu()
            }
        },

        updatePosition() {
            const trigger = this.$refs.trigger
            const menu = this.$refs.menu

            if (!trigger || !menu) return

            const triggerRect = trigger.getBoundingClientRect()
            const menuRect = menu.getBoundingClientRect()

            let x = triggerRect.left + this.offsetX
            let y = triggerRect.bottom + this.offsetY

            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            if (x + menuRect.width > viewportWidth) {
                x = triggerRect.right - menuRect.width
            }

            if (y + menuRect.height > viewportHeight) {
                y = triggerRect.top - menuRect.height - this.offsetY
            }

            if (x < 8) x = 8
            if (y < 8) y = 8

            this.position.x = x
            this.position.y = y
        },

        handleOutsideClick(event) {
            if (!this.isOpen) return;

            const menu = this.$refs.menu;
            const trigger = this.$refs.trigger;

            const clickedInsideMenu = menu && menu.contains(event.target);
            const clickedInsideTrigger = trigger && trigger.contains(event.target);

            if (clickedInsideMenu || clickedInsideTrigger) return;

            this.closeMenu();
        },

        handleEscape(event) {
            if (event.key === 'Escape' && this.isOpen) this.closeMenu();
        },

        handleViewportChange() {
            if (this.isOpen) {
                this.updatePosition()
            }
        },

        handleScroll() {
            if (!this.isOpen) return;

            if (this.closeOnScroll) {
                this.closeMenu();
            } 
            else {
                this.updatePosition();
            }
        }
    }
}
</script>

<style scoped>
.context-menu-trigger {
    line-height: 1;
}
</style>
