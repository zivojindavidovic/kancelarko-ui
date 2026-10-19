import { reactive } from 'vue';

export const layoutStore = reactive({
    /* mobile nav */
	isSidebarOpen: false,

	toggleSidebar() {
		this.isSidebarOpen = !this.isSidebarOpen;
	},

	openSidebar() {
		this.isSidebarOpen = true;
	},

	closeSidebar() {
		this.isSidebarOpen = false;
	},

    /* minimize sidebar */
    isSidebarMinimized: false,

    toggleMinimizeSidebar() {
        this.isSidebarMinimized = !this.isSidebarMinimized;
    },

    minimizeSidebar() {
        this.isSidebarMinimized = true;
    },

    maximizeSidebar() {
        this.isSidebarMinimized = false;
    }
});