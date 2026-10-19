<template>
	<div class="sidebar" :class="{ 'sidebar-minimized': layoutStore.isSidebarMinimized, 'mobile-sidebar-open': layoutStore.isSidebarOpen }">

		<!-- HEADER -->
		<div class="sidebar-header">
			<slot name="header" :toggle="toggleSidebar" :minimized="layoutStore.isSidebarMinimized">
				<div class="sidebar-header-row">
					<div v-if="minimizable && !layoutStore.isSidebarOpen" class="header-menu-icon" @click="toggleSidebar">
						<k-icon name="menu-right" wrapperClass="icon-md"/>
					</div>

					<a class="header-logo" :href="logoUrl">
						<slot name="logo" :theme="currentTheme">
							<k-icon :key="resolvedLogoIcon" :name="resolvedLogoIcon" />
						</slot>
					</a>

					<span v-if="title" class="header-title">{{ title }}</span>
				</div>
			</slot>
		</div>

		<!-- CONTENT -->
		<div class="sidebar-content">
			<div class="sidebar-navigation">

				<!-- MODULE -->
				<template v-if="module || $slots.module">
					<div class="sidebar-nav-row">
						<div class="sidebar-nav-item align-items-center selected-module">
							<slot name="module" :module="module">
								<div class="sidebar-module-icon">
									<k-icon :name="module.icon" :wrapperClass="['module-icon', module.color || 'yellow-icon']" />
								</div>
								<div class="sidebar-module-title">
									<span class="sidebar-module-title-text">{{ module.label }}</span>
								</div>
							</slot>
						</div>
					</div>

					<hr class="sidebar-row-separator selected-module-divider" />
				</template>

				<slot name="before-items" />

				<template v-for="(item, index) in visibleItems" :key="item.id || item.label || index">
					<hr v-if="item.separator" class="sidebar-row-separator" />

					<KSidebarItem
						v-else
						:item="item"
						:icon="item.icon"
						:color="item.color"
						:label="item.label"
						:url="item.url"
						:target="item.target"
						:active="item.active"
						:children="item.children || []"
						:current-path="currentPath"
						@click="onItemClick"
						@child-click="onItemClick"
					/>
				</template>

				<slot name="after-items" />
			</div>
		</div>

		<!-- modali i ostali sadrzaj koji zivi unutar sidebar-a -->
		<slot />
	</div>
</template>

<script>
	import KSidebarItem from './KSidebarItem.vue'
	import { layoutStore } from '../page/layout-store';
	import { resolveThemeFor, THEME_CHANGE_EVENT } from '../../../helpers/theme';

	/**
	 * Stavka navigacije:
	 * {
	 *   id?: string,
	 *   icon: string,            // naziv ikonice (src/icons)
	 *   color?: string,          // npr. 'yellow-icon', 'blue-icon' (vidi components/_icons.scss)
	 *   label: string,
	 *   url?: string,
	 *   target?: string,
	 *   active?: boolean,        // rucno forsiranje aktivnog stanja
	 *   visible?: boolean | () => boolean,
	 *   onClick?: (event, item) => void,
	 *   children?: [{ label, url, target?, children? }],
	 *   separator?: true         // umesto stavke renderuje <hr>
	 * }
	 */
	export default {
		name: 'KSidebar',

		components: {
			KSidebarItem,
		},

		props: {
			items: {
				type: Array,
				default: () => []
			},
			/* { icon, color, label } - red sa trenutno izabranim modulom */
			module: {
				type: Object,
				default: null
			},
			title: {
				type: String,
				default: ''
			},
			/* logo za tamnu temu */
			logoIcon: {
				type: String,
				default: 'kancelarko-logo-full'
			},
			/* logo za svetlu temu (null = isti kao logoIcon) */
			logoIconLight: {
				type: String,
				default: 'kancelarko-logo-full-light'
			},
			logoUrl: {
				type: String,
				default: '/'
			},
			minimizable: {
				type: Boolean,
				default: true
			},
			/* putanja za detekciju aktivne stavke; default window.location.pathname */
			currentPath: {
				type: String,
				default: null
			},
			/* da li klik na toggle menja i .content klasu u DOM-u (korisno bez KLayout-a) */
			syncContentClass: {
				type: Boolean,
				default: true
			}
		},

		emits: ['item-click', 'toggle'],

		data() {
			return {
				layoutStore,
				currentTheme: resolveThemeFor(null),
				themeObserver: null,
			}
		},

		computed: {
			resolvedLogoIcon() {
				if (this.currentTheme === 'light' && this.logoIconLight) {
					return this.logoIconLight;
				}

				return this.logoIcon;
			},

			visibleItems() {
				return this.items.filter((item) => {
					if (typeof item.visible === 'function') {
						return item.visible(item);
					}

					return item.visible !== false;
				});
			}
		},

		methods: {
			syncTheme() {
				this.currentTheme = resolveThemeFor(this.$el);
			},

			toggleSidebar() {
				this.layoutStore.toggleMinimizeSidebar();

				if (this.syncContentClass) {
					document.querySelector('.content')?.classList.toggle('sidebar-minimized', this.layoutStore.isSidebarMinimized)
				}

				this.$emit('toggle', this.layoutStore.isSidebarMinimized)
			},

			onItemClick({ item, event }) {
				if (item && typeof item.onClick === 'function') {
					item.onClick(event, item)
				}

				this.$emit('item-click', { item, event })
			},

			handleResizeEvent(){
				/* kada doje do resize-a, onda resetovati/zatvoriti mobilnu navigaciju */
				this.layoutStore.closeSidebar();
				this.layoutStore.maximizeSidebar(); //ako je bio kojim slucajem minimize

				if (this.syncContentClass) {
					document.querySelector('.content')?.classList.remove('sidebar-minimized')
				}
			},
		},
		mounted(){
			this.syncTheme()
			this.themeObserver = new MutationObserver(this.syncTheme)
			this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
			this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] })
			window.addEventListener(THEME_CHANGE_EVENT, this.syncTheme)
			window.addEventListener('resize', this.handleResizeEvent)
		},
		beforeUnmount(){
			this.themeObserver?.disconnect()
			window.removeEventListener(THEME_CHANGE_EVENT, this.syncTheme)
			window.removeEventListener('resize', this.handleResizeEvent)
		}
	}
</script>
