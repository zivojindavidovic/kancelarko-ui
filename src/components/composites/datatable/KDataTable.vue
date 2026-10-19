<template>
    <!-- simuliranje top scroll-a  -->
    <div v-if="topScroll" ref="topScroll" class="datatable-top-scroll" :class="{'has-fixed-header': isFixedHeaderEnabled()}" @scroll="handleTopScroll" >
		<div
			class="datatable-top-scroll-content"
			:style="{ width: `${topScrollWidth}px` }"
		></div>
	</div>

    <div class="app-datatable-container table-responsive position-relative" :class="{'has-fixed-header': isFixedHeaderEnabled(), 'has-top-scroll': topScroll, 'dt-header-dark': darkHeader, }">
        
        <div v-if="isLoading" class="datatable-overlay" >
        <!-- bs: spinner-border  custom: spinner-kancelarko - zameniti klase i ukljuciti custom ikonicu -->
            <div class="spinner-kancelarko primary-color">
                <!-- otkomentarisati kada irina uradi okrugli svg -->
                <k-icon name="kancelarko-spinner" :wrapperClass="['icon-spinner']"/>
            </div>
        </div>

        <DataTable 
            ref="dataTable" 
            :data="data"
            :options="mergedOptions" 
            class="display nowrap w-100" 
            @init="handleInit"
        >
            <!-- Custom header slot -->
            <thead v-if="$slots.header">
                <slot name="header" />
            </thead>

            <!-- Dinamičko prosleđivanje svih slotova -->
            <template v-for="(_, slotName) in $slots" #[slotName]="props">
                <slot :name="slotName" v-bind="props" />
            </template>
        </DataTable>
    </div>
</template>

<script>
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net';

import 'datatables.net-fixedheader';

DataTable.use(DataTablesCore);

export default {
    name: 'KDataTable',

    components: {
        DataTable
    },

    props: {
        data: {
            type: Array,
            default: () => []
        },

        topScroll: {
            type: Boolean,
            default: false
        },

        darkHeader: {
            type: Boolean,
            default: false,
        },

        columns: {
            type: Array,
            required: true
        },

        ajax: {
            type: [Object, Function],
            default: null
        },

        options: {
            type: Object,
            default: () => ({})
        },

        locale: {
            type: [Object, String],
            default: ''
        },

        serverSide: {
            type: Boolean,
            default: true
        },

        processing: {
            type: Boolean,
            default: true
        },

        sortable: {
            type: Boolean,
            default: true
        },

        defaultSort: {
            type: Array,
            default: () => []
        },

        pageLength: {
            type: Number,
            default: 10
        },

        lengthMenu: {
            type: Array,
            default: () => [10, 25, 50, 100]
        }
    },

    emits: [
        'ready'
    ],

    data() {
        return {
            instance: null,
            isLoading: false, 
            topScrollWidth: 0, /* top scroll */
            dataTableScrollBody: null, /* top scroll */
            topScrollResizeObserver: null, /* top scroll */
            isSynchronizingScroll: false /* top scroll */
            
        };
    },

    computed: {
        defaultLanguage() {
            return {
                emptyTable: 'Nema podataka za prikaz.',
                info: 'Prikaz _START_ do _END_ od ukupno _TOTAL_ zapisa',
                infoEmpty: 'Prikaz 0 do 0 od ukupno 0 zapisa',
                infoFiltered: '(filtrirano od ukupno _MAX_ zapisa)',
                lengthMenu: 'Prikaži _MENU_ zapisa',
                loadingRecords: 'Učitavanje...',
                processing: 'Obrada...',
                zeroRecords: 'Nema pronađenih rezultata.',
                paginate: {
                    next: '',
                    previous: ''
                }
            };
        },

        defaultLayout() {
            return {
                topStart: null,
                topEnd: null,
                bottomStart: null,
                bottomEnd: 'paging'
            };
        },

        defaultOptions() {
            return {
                processing: true,
                responsive: false,
                deferRender: true,
                pageLength: this.pageLength,
                autoWidth: false,
                lengthMenu: this.lengthMenu,
                ordering: true,
                searching: false,
                pagingType: 'simple_numbers',
                info: false,
                layout: this.defaultLayout,
                language: this.defaultLanguage,
                columnDefs: [
                    {
                        targets: '_all',
                        className: 'dt-head-left'
                    }
                ]
            };
        },

        localizedLanguage() {
            const inheritedLocale = typeof this.$parent?.locale === 'string'
                ? {}
                : (this.$parent?.locale || {});

            const localeSource = typeof this.locale === 'string'
                ? inheritedLocale
                : (this.locale || inheritedLocale);

            const dataTableLocale = localeSource.dataTable || {};

            return {
                emptyTable: dataTableLocale.zeroRecords ?? this.defaultLanguage.emptyTable,
                info: dataTableLocale.info ?? this.defaultLanguage.info,
                infoEmpty: dataTableLocale.infoEmpty ?? this.defaultLanguage.infoEmpty,
                infoFiltered: dataTableLocale.infoFiltered ?? this.defaultLanguage.infoFiltered,
                lengthMenu: dataTableLocale.lengthMenu ?? this.defaultLanguage.lengthMenu,
                loadingRecords: dataTableLocale.processing ?? this.defaultLanguage.loadingRecords,
                processing: dataTableLocale.processing ?? this.defaultLanguage.processing,
                zeroRecords: dataTableLocale.zeroRecords ?? this.defaultLanguage.zeroRecords,
                paginate: {
                    next: '',
                    previous: ''
                }
            };
        },

        mergedOptions() {
            const options = this.options || {};

            return {
                ...this.defaultOptions,
                ...options,

                ajax: this.ajax,
                columns: this.columns,
                serverSide: this.serverSide,
                processing: this.processing,
                ordering: this.sortable,
                order: this.defaultSort.length > 0 ? this.defaultSort : [[0, 'asc']],

                layout: {
                    ...this.defaultLayout,
                    ...(options.layout || {})
                },

                language: {
                    ...this.defaultLanguage,
                    ...this.localizedLanguage,
                    ...(options.language || {}),
                    paginate: {
                        ...this.defaultLanguage.paginate,
                        ...this.localizedLanguage.paginate,
                        ...(options.language?.paginate || {})
                    },
                },

            };
        },
        
    },

    methods: {
        handleInit(dtInstance) {
            
            this.instance = dtInstance;

            //ukoliko je prosledjena opcija za fixedHeader u prop-u. a ucitava se prvo na mobilnom
            this.$nextTick(() => {
                requestAnimationFrame(() => {
                    const dt = this.getDt();

                    dt.columns.adjust(); //korekcija zbog 

                    this.updateHeaderOffset(); // korekcija offseta

                    if (this.isFixedHeaderEnabled()) {
                        dt?.fixedHeader?.adjust();
                    }

                    dt.on('processing.dt', (e, settings, processing) => {
                        this.isLoading = processing;
                    });

                    /* ako je ukljucen top scroll - vidi ovo mozda moze i na drugom mestu */
                    dt?.on('draw.dt.topScroll', () => {
                        if (!this.topScroll) {
                            return;
                        }

                        this.$nextTick(() => {
                            requestAnimationFrame(() => {
                                if (!this.dataTableScrollBody) {
                                    this.initializeTopScroll();
                                    return;
                                }

                                this.updateTopScrollWidth();
                            });
                        });
                    });

                    if (this.topScroll) {
                        this.initializeTopScroll();
                    }
                });
            });

            this.$emit('ready', dtInstance);
        },

        getDt() {
            if (!this.instance) return null;
            return this.instance.dt || this.instance || null;
        },

        reload(resetPaging = true) {
            const dt = this.getDt();
            if (!dt?.ajax?.reload) return;

            dt.ajax.reload(null, resetPaging);
        },

        setPageLength(length, redraw = true) {
            const dt = this.getDt();
            const normalizedLength = Number(length);

            if (!dt?.page?.len || !Number.isFinite(normalizedLength) || normalizedLength <= 0) {
                return;
            }

            dt.page.len(normalizedLength);

            if (redraw) {
                dt.draw(false);
            }
        },

        setOrder(order, redraw = true) {
            const dt = this.getDt();
            if (!dt?.order || !Array.isArray(order)) return;

            dt.order(order);

            if (redraw) {
                dt.draw();
            }
        },

        goToPage(pageIndex) {
            const dt = this.getDt();
            const normalizedPage = Number(pageIndex);

            if (!dt?.page || !Number.isInteger(normalizedPage) || normalizedPage < 0) {
                return;
            }

            dt.page(normalizedPage).draw('page');
        },

        draw(resetPaging = false) {
            
            const dt = this.getDt();
            if (!dt?.draw) return;

            dt.draw(resetPaging);
            /* ako je ukljucen fixedHeader - odarditi rekalkulaciju offset-a za sticky header */
            if (this.options.hasOwnProperty('fixedHeader')) {
                this.updateHeaderOffset();
            }
        },

        updateHeaderOffset() {
            
            if (this.options.hasOwnProperty('fixedHeader')) {
                /* ako prop nije prosledjen */
                if (!this.isFixedHeaderEnabled()) {
                    return;
                }

                const dt = this.getDt();
                /* provera da li je prop != true */
                if (!dt?.fixedHeader?.headerOffset) {
                    return;
                }

                const offset = window.innerWidth <= 991 ? 85 : 0;

                dt.fixedHeader.headerOffset(offset);
                dt.fixedHeader.adjust();
            }
            
        },
        
        isFixedHeaderEnabled() {
            return Boolean(this.options?.fixedHeader);
        },

        getDataTableScrollBody() {
            const dt = this.getDt();
            const container = dt?.table?.().container?.();

            if (!container) {
                return null;
            }

            return container.querySelector('.dt-scroll-body');
        },

        initializeTopScroll() {
            if (!this.topScroll) {
                return;
            }

            this.destroyTopScroll();

            this.$nextTick(() => {
                requestAnimationFrame(() => {
                    const scrollBody = this.getDataTableScrollBody();

                    if (!scrollBody || !this.$refs.topScroll) {
                        return;
                    }

                    this.dataTableScrollBody = scrollBody;

                    this.updateTopScrollWidth();

                    scrollBody.addEventListener(
                        'scroll',
                        this.handleDataTableScroll,
                        { passive: true }
                    );

                    this.topScrollResizeObserver = new ResizeObserver(() => {
                        this.updateTopScrollWidth();
                    });

                    this.topScrollResizeObserver.observe(scrollBody);

                    const table = scrollBody.querySelector('table');

                    if (table) {
                        this.topScrollResizeObserver.observe(table);
                    }
                });
            });
        },

        updateTopScrollWidth() {
            if (!this.topScroll || !this.dataTableScrollBody) {
                return;
            }

            this.topScrollWidth = this.dataTableScrollBody.scrollWidth;

            this.$nextTick(() => {
                if (!this.$refs.topScroll) {
                    return;
                }

                this.$refs.topScroll.scrollLeft =
                    this.dataTableScrollBody.scrollLeft;
            });
        },

        handleTopScroll(event) {
            if (
                !this.dataTableScrollBody ||
                this.isSynchronizingScroll
            ) {
                return;
            }

            this.isSynchronizingScroll = true;

            this.dataTableScrollBody.scrollLeft =
                event.target.scrollLeft;

            requestAnimationFrame(() => {
                this.isSynchronizingScroll = false;
            });
        },

        handleDataTableScroll(event) {
            if (
                !this.$refs.topScroll ||
                this.isSynchronizingScroll
            ) {
                return;
            }

            this.isSynchronizingScroll = true;

            this.$refs.topScroll.scrollLeft =
                event.target.scrollLeft;

            requestAnimationFrame(() => {
                this.isSynchronizingScroll = false;
            });
        },

        destroyTopScroll() {
            if (this.dataTableScrollBody) {
                this.dataTableScrollBody.removeEventListener(
                    'scroll',
                    this.handleDataTableScroll
                );
            }

            if (this.topScrollResizeObserver) {
                this.topScrollResizeObserver.disconnect();
            }

            this.dataTableScrollBody = null;
            this.topScrollResizeObserver = null;
            this.topScrollWidth = 0;
        },
    },
    watch: {
        topScroll(enabled) {
            if (enabled) {
                this.initializeTopScroll();
                return;
            }

            this.destroyTopScroll();
        }
    },
    mounted() {
        //ukoliko je prosledjena opcija za fixedHeader u prop-u
        if (this.isFixedHeaderEnabled()) {
            window.addEventListener("resize", this.updateHeaderOffset);
        }
       
        
    },
    beforeUnmount() {
        //ukoliko je prosledjena opcija za fixedHeader u prop-u
        if (this.isFixedHeaderEnabled()) {
            window.removeEventListener("resize", this.updateHeaderOffset);
        }

        /* iskljucivanje topScroll eventa */
        const dt = this.getDt();
        dt?.off?.('.topScroll');
        this.destroyTopScroll();
    },
};
</script>
