<template>
    <div class="header">
        <div class="header-hamburger cursor-pointer" @click="layoutStore.toggleSidebar()">
            <k-icon name="menu" wrapperClass="icon-md" v-if="!layoutStore.isSidebarOpen"/>
            <k-icon name="close" wrapperClass="icon-md" v-else/>
        </div>

        <!-- LEFT ICONS -->
        <div class="header-menu">
            <slot name="actions-before" v-bind="slotApi" />

            <component
                v-for="action in visibleActions"
                :key="action.id || action.icon"
                :is="action.href && !action.modalId ? 'a' : 'div'"
                class="header-icon"
                :class="[action.class, {
                    'cursor-pointer': !action.disabled,
                    'header-icon-active': action.modalId && activeModalID === action.modalId,
                    'header-icon-disabled': action.disabled,
                }]"
                :href="action.href && !action.modalId && !action.disabled ? action.href : null"
                :target="action.href ? (action.target || null) : null"
                :rel="action.target === '_blank' ? 'noopener noreferrer' : null"
                :aria-label="action.ariaLabel || action.tooltip || null"
                :aria-disabled="action.disabled ? 'true' : null"
                @click="onActionClick(action, $event)"
            >
                <KTooltip v-if="action.tooltip" :text="action.tooltip" placement="bottom" :wrap="false">
                    <span class="d-flex icon-md">
                        <k-icon :name="resolveIcon(action)" />
                    </span>
                </KTooltip>

                <span v-else class="d-flex icon-md">
                    <k-icon :name="resolveIcon(action)" />
                </span>
            </component>

            <slot name="actions" v-bind="slotApi" />
        </div>

        <!-- AVATAR -->
        <div v-if="showAvatar" class="header-avatar cursor-pointer" @click="onAvatarClick($event)">
            <slot name="avatar" :user="user">
                <KAvatar
                    :src="user.avatar"
                    :who="user.fullName"
                    size="large"
                />
            </slot>
        </div>

        <!-- MODALS (KHeaderModal) -->
        <slot v-bind="slotApi" />
    </div>
</template>


<script>
import { layoutStore } from '../page/layout-store';
import KTooltip from '../../atoms/tooltip/KTooltip.vue'
import KAvatar from '../../atoms/avatar/KAvatar.vue'

/**
 * Akcija u header-u:
 * {
 *   id?: string,
 *   icon: string | (action) => string,
 *   tooltip?: string,
 *   href?: string,             // renderuje <a href> (navigacija)
 *   target?: string,           // '_blank' otvara novi tab
 *   disabled?: boolean,        // siva ikonica, bez klika (header-icon-disabled)
 *   ariaLabel?: string,
 *   modalId?: string,          // id KHeaderModal-a koji se otvara ispod ikonice
 *   modalOffset?: number,      // dodatni vertikalni razmak (px, moze i minus)
 *   onClick?: (event, action, api) => void,
 *   class?: string | object | array,
 *   visible?: boolean | () => boolean,
 *   badge?: boolean            // koristi se iz resolveIcon (npr. notification-active)
 * }
 */
export default {
    name: "KHeader",

    components: {
        KTooltip, KAvatar
    },

    props: {
        actions: {
            type: Array,
            default: () => []
        },
        user: {
            type: Object,
            default: () => ({
                fullName: '',
                email: '',
                avatar: '',
            })
        },
        showAvatar: {
            type: Boolean,
            default: true
        },
        /* id KHeaderModal-a koji se otvara klikom na avatar (null = samo emituje avatar-click) */
        accountModalId: {
            type: String,
            default: 'account-modal'
        },
        accountModalOffset: {
            type: Number,
            default: -10
        },
    },

    emits: ['action-click', 'avatar-click', 'modal-open', 'modal-close'],

    data() {
        return {
            activeModalID: null,
            layoutStore,
        };
    },

    computed: {
        visibleActions() {
            return this.actions.filter((action) => {
                if (typeof action.visible === 'function') {
                    return action.visible(action);
                }

                return action.visible !== false;
            });
        },

        slotApi() {
            return {
                triggerModal: this.triggerModal,
                closeModal: this.closeModalById,
                closeHeaderModals: this.closeHeaderModals,
                activeModalId: this.activeModalID,
            };
        }
    },

    methods: {
        resolveIcon(action) {
            return typeof action.icon === 'function' ? action.icon(action) : action.icon;
        },

        onActionClick(action, event) {
            if (action.disabled) {
                event.preventDefault();
                return;
            }

            if (typeof action.onClick === 'function') {
                action.onClick(event, action, this.slotApi);
            }

            if (action.modalId) {
                this.triggerModal(event.currentTarget, action.modalId, action.modalOffset ?? 0);
            }
            // href akcije su <a> elementi - navigacija ide prirodno

            this.$emit('action-click', { action, event });
        },

        onAvatarClick(event) {
            this.$emit('avatar-click', event);

            if (this.accountModalId && document.getElementById(this.accountModalId)) {
                this.triggerModal(event.currentTarget, this.accountModalId, this.accountModalOffset);
            }
        },

        /* pokrece otvaranje modala [button: DOM element ili naziv ref-a] */
        triggerModal(button, modalID, addOffset = 0){
            const buttonEl = typeof button === 'string' ? this.$refs[button] : button;
            const modalContainer = document.getElementById(modalID);

            if (!buttonEl || !modalContainer) {
                return;
            }

            /* ako je vec otvoren, zatvori ga */
            if (modalID == this.activeModalID) {
                this.closeModal(modalContainer)
                return
            }
            /* zatvorice otvorene modale */
            this.closeHeaderModals(modalContainer)

            /* logika oko prikaza modala */
            this.activeModalID = modalID
            this.toggleModal(modalContainer, buttonEl, addOffset);
        },
        // logika oko prikazivanja modala [addOffset: koliko px zelimo da bude udaljen od trigger-a dodatno(moze i minus)]
        toggleModal(modalContainer, button, addOffset = 0) {

            setTimeout(() => {
                if (!modalContainer.classList.contains('show-header-modal')) {

                    /* dohvatanje lokacije/dimenzija kliktabilnog elementa */
                    const RECT = button.getBoundingClientRect();

                    /* dohvatanje dimenzija modala */
                    const MODALRECT = modalContainer.getBoundingClientRect()

                    /* podesavanje distance izmedju dugmeta i diva */
                    const MODAL_TOP_OFFSET = 25 + addOffset;

                    /* nove pozicije diva */
                    let leftPosition = `${RECT.left}`;
                    let topPosition = `${RECT.bottom + MODAL_TOP_OFFSET}`;

                    /* dodatno podesavanje horizontalne pozicije */
                    let horizontalOffset = MODALRECT.width - RECT.width;

                    /* na malom ekranu drugaciji parametri */
                    if (window.matchMedia('screen and (max-width: 992px)').matches) {
                        leftPosition = 15; //vrednost margine/padding-a na body
                        horizontalOffset = 0;
                    }

                    /* postavljanje novih vrednosti za poziciju diva */
                    modalContainer.style.left = `${leftPosition}px`;
                    modalContainer.style.top = `${topPosition}px`;

                    modalContainer.style.transform = `translateX(-${horizontalOffset}px)`;
                    modalContainer.classList.add('show-header-modal');

                    this.$emit('modal-open', modalContainer.id);

                    return;
                }

                this.closeModal(modalContainer);
            }, 100);
        },

        closeModal(modalContainer, resetActive = true) {
            if (!modalContainer) {
                return;
            }

            const wasOpen = modalContainer.classList.contains('show-header-modal');

            modalContainer.style.transform = `translateX(0px)`;
            modalContainer.classList.remove('show-header-modal');

            if (resetActive) {
                this.activeModalID = null;
            }

            if (wasOpen) {
                this.$emit('modal-close', modalContainer.id);
            }
        },

        closeModalById(modalID, resetActive = true) {
            this.closeModal(document.getElementById(modalID), resetActive);
        },

        /* doNotHideThisModal: ako ne zelimo da sakrijemo odredjeni modal (referenca modala) */
        closeHeaderModals(doNotHideThisModal = false, resetActive = false) {
            const headerModals = document.getElementsByClassName('header-modal');

            if (headerModals.length) {
                for (let i = 0; i < headerModals.length; i++) {

                    if (doNotHideThisModal != false && headerModals[i] == doNotHideThisModal) {
                        continue;
                    }

                    this.closeModal(headerModals[i], resetActive);
                }
            }
        },

        handleResizeEvent(){
            /* kada se desi window resize, gasimo modale i resetujemo activeModalID */
            this.closeHeaderModals(false, true)
        },

        handleClickOutside(event) {
            if (!this.activeModalID) return;

            const modalContainer = document.getElementById(this.activeModalID);

            if (!modalContainer) {
                this.activeModalID = null;
                return;
            }

            if (modalContainer.classList.contains('show-header-modal') && !modalContainer.contains(event.target)) {
                this.closeModal(modalContainer, true);
            }
        },
    },
    mounted(){
        window.addEventListener('resize', this.handleResizeEvent)
        document.addEventListener('click', this.handleClickOutside)
    },
    beforeUnmount(){
        window.removeEventListener('resize', this.handleResizeEvent)
        document.removeEventListener('click', this.handleClickOutside)
    }
};
</script>
