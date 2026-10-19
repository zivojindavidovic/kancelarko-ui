<template>
    <div class="app-calendar" :class="rootClass">
        <div class="app-calendar__topbar">
            <!-- levo: prev/next/today -->
            <div class="app-calendar__nav">
                <button type="button" class="btn btn-sm btn-primary btn-circle me-2" @click="prevYear">
                    <k-icon wrapperClass="icon-sm" name="double-chevron-left" />
                </button>
                <button type="button" class="btn btn-sm btn-primary btn-circle me-2" @click="prev">
                    <k-icon wrapperClass="icon-sm" name="chevron-left" />
                </button>
                <button type="button" class="btn btn-sm btn-primary btn-circle me-2" @click="next">
                    <k-icon wrapperClass="icon-sm" name="chevron-right" />
                </button>
                <button type="button" class="btn btn-sm btn-primary btn-circle me-2" @click="nextYear">
                    <k-icon wrapperClass="icon-sm" name="double-chevron-right" />
                </button>
                <!-- <button type="button" class="btn" @click="today">today</button> -->
            </div>

            <!-- centar: naslov -->
            <div class="app-calendar__title">{{ title }}</div>

            <!-- desno: view switch -->
            <div class="app-calendar__options">
                <!-- <button type="button" class="btn" @click="changeView('dayGridMonth')">month</button>
                <button type="button" class="btn" @click="changeView('timeGridWeek')">week</button>
                <button type="button" class="btn" @click="changeView('timeGridDay')">day</button> -->
                <KSelect
                    v-model="selectedCalendarView"
                    :options="calendarViewOptions"
                    :canClear="false"
                    :searchable="false"
                    label="name"
                    value-prop="value"
                    :sizeSM="true"
                    :lightBackground="true"
                />

                <button
                    type="button"
                    class="btn btn-link p-0 border-0"
                    :class="{ 'position-relative': filtersOpen }"
                    :style="filtersOpen ? { zIndex: 1060 } : null"
                    @click="$emit('filter-click')"
                >
                    <k-icon name="filter" wrapperClass="icon-md calendar-filters-icon cursor-pointer"/>
                </button>
            </div>
        </div>

        <!-- OVDE ide filter komponenta -->
        <div class="app-calendar__filters">
            <slot name="filters" />
            <!-- <h6>Ovde idu filteri</h6> -->
        </div>
            

        <FullCalendar ref="fc" :options="calendarOptions">
            <template #eventContent="arg">
                <KCalendarEvent :event="arg.event"/>
            </template>
        </FullCalendar>
    </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Ako želiš srpski locale:
// npm i @fullcalendar/core
// import srLocale from '@fullcalendar/core/locales/sr';
// (ili samo proslediš locale string, pa dodaš kasnije)

import { getCalendarTypeUiMap } from './calendar-type-ui-map';
import KCalendarEvent from './KCalendarEvent.vue'; //event chip sa stilovima - samo prikaz
import KSelect from '../../atoms/select/KSelect.vue';
import { resolveFullCalendarLocale } from '../../../helpers/locale';

export default {
    name: 'KCalendar',
    components: { FullCalendar, KCalendarEvent, KSelect},
    data(){
        return {
            title: '',
            isSyncingCalendarView: false,
            resizeObserver: null,
            resizeAnimationFrame: null,
            calendarWidth: null,
            selectedCalendarView: {id: 0, value: 'dayGridMonth', name: 'Mesečni'}, //default prikaz
            calendarViewOptions: [ //opcije za prikaz kalendara
                {id: 0, value: 'dayGridMonth', name: 'Mesečni'},
                {id: 1, value: 'timeGridWeek', name: 'Nedeljni'},
                {id: 2, value: 'timeGridDay', name: 'Dnevni'},
            ]
        }
    },

    props: {
        /**
         * Lista eventova (FullCalendar format).
         * Podržavamo i "extendedProps" (npr. type, icon, meta...).
         */
        events: { type: Array, default: () => [] },

        /**
         * month/week/day
         * (dayGridMonth, timeGridWeek, timeGridDay)
         */
        initialView: { type: String, default: 'dayGridMonth' },

        /**
         * Uključi/isključi prikaze u headeru.
         */
        enableMonthView: { type: Boolean, default: true },
        enableWeekView: { type: Boolean, default: true },
        enableDayView: { type: Boolean, default: true },

        /**
         * Prikaz header toolbara (nav + title + view switch)
         */
        showToolbar: { type: Boolean, default: true },

        /**
         * Max broj eventova pre "+ još N"
         */
        dayMaxEvents: { type: [Boolean, Number], default: 3 },

        /**
         * Locale / prvi dan u nedelji
         */
        locale: { type: [String, Object], default: 'sr' },
        firstDay: { type: Number, default: 1 }, // 1 = ponedeljak

        /**
         * Vikendi (u dizajnu često nema sub/ned)
         */
        weekends: { type: Boolean, default: true },

        filtersOpen: { type: Boolean, default: false },

        /**
         * Dodatna klasa na root wrapper
         */
        rootClass: { type: [String, Array, Object], default: '' },

        /**
         * Mapiranje tipa eventa -> UI meta (klase/ikonice)
         * Možeš menjati bez diranja komponente.
         *
         * Primer:
         * {
         *   birthday: { class: 'is-birthday', icon: '🎂' },
         *   slava: { class: 'is-slava', icon: '🕯️' }
         * }
         */
        typeUiMap: {
            type: Object,
            default: () => getCalendarTypeUiMap(),
        },
    },

    emits: [
        /**
         * Event klik (ti otvaraš modal u parentu)
         */
        'event-click',

        /**
         * Klik na dan (prazna ćelija) (ti otvaraš context menu / modal)
         */
        'date-click',

        /**
         * Klik na "+ još N"
         */
        'more-link-click',

        /**
         * Kada promeni view (month/week/day) - koristi za fetch logiku
         */
        'view-change',
        'filter-click',
    ],

    computed: {
        headerToolbar() {
            if (!this.showToolbar) return false;

            const rightButtons = [];
            if (this.enableMonthView) rightButtons.push('dayGridMonth');
            if (this.enableWeekView) rightButtons.push('timeGridWeek');
            if (this.enableDayView) rightButtons.push('timeGridDay');

            return {
                left: 'prev,next today',
                center: 'title',
                right: rightButtons.join(','),
            };
        },

        calendarOptions() {
            const calendarLocale = this.resolvedLocale;

            return {
                plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
                allDayText: calendarLocale.allDayText,
                initialView: this.initialView,
                headerToolbar: this.headerToolbar,
                locale: calendarLocale.code,
                firstDay: this.firstDay,
                weekends: this.weekends,
                events: this.events,
                // Visina kalendara ne treba da raste zajedno sa njegovom širinom.
                height: 'auto',
                // stacking + "+ još N"
                dayMaxEvents: this.dayMaxEvents,
                // format naziva danova
                dayHeaderContent: (arg) => calendarLocale.daysLong[arg.date.getDay()],
                // UX
                selectable: false,
                editable: false,
                navLinks: false,
                // da bi klik na "prazan dan" radio kako očekuješ
                dateClick: this.onDateClick,
                // klik na event
                eventClick: this.onEventClick,
                // klik na "+ još N"
                moreLinkClick: this.onMoreLinkClick,
                // kad se promeni prikaz
                datesSet: this.onDatesSet,
                // custom render eventa (ikonica + title)
                // eventContent: this.renderEventContent,

                // dodavanje klasa po tipu
                eventClassNames: this.getEventClassNames,
                // nema forsirane dodatne nedelje
                fixedWeekCount: false,  
                // + jos N (tekst se podesava u renderMoreLink())
                moreLinkContent: this.renderMoreLink,
                // gasimo default toolbar - pravimo nas zbog dizajna
                headerToolbar: false,
            };
        },

        resolvedLocale() {
            return resolveFullCalendarLocale(window.appLocale || 'rs');
        },
    },

    methods: {
        getApi() {
            return this.$refs.fc ? this.$refs.fc.getApi() : null;
        },

        navigate(action) {
            const api = this.getApi();
            if (!api) return;

            action(api);
            this.$nextTick(this.syncTitle);
        },

        prev() { this.navigate((api) => api.prev()); },
        next() { this.navigate((api) => api.next()); },
        nextYear() { this.navigate((api) => api.incrementDate({ years: 1 })); },
        prevYear() { this.navigate((api) => api.incrementDate({ years: -1 })); },
        today() { this.navigate((api) => api.today()); },
        changeView(viewName) { this.navigate((api) => api.changeView(viewName)); },

        syncTitle() {
            const api = this.getApi();
            this.title = api?.view?.title || '';
        },

        /* changeView(viewName) {
            const api = this.getApi();
            if (!api) return;
            api.changeView(viewName);
        }, */

        setDate(date) {
            const api = this.getApi();
            if (!api) return;
            api.gotoDate(date);
        },

        refetchEvents() {
            const api = this.getApi();
            if (!api) return;
            api.refetchEvents();
        },

        // --- handlers ---
        onEventClick(info) {
            // info.event (FullCalendar EventApi)
            // info.jsEvent (MouseEvent)
            this.$emit('event-click', {
                event: info.event,
                el: info.el,
                jsEvent: info.jsEvent,
                view: info.view,
            });
        },

        onDateClick(info) {
            // info.date, info.dateStr, info.jsEvent
            // Dajemo i koordinate za context menu
            const e = info.jsEvent;
            this.$emit('date-click', {
                date: info.date,
                dateStr: info.dateStr,
                jsEvent: e,
                view: info.view,
                // koordinate za context menu
                clientX: e?.clientX,
                clientY: e?.clientY,
                pageX: e?.pageX,
                pageY: e?.pageY,
            });
        },

        onMoreLinkClick(info) {
            // info.date, info.allSegs, info.hiddenSegs, info.jsEvent, info.view
            this.$emit('more-link-click', info);
            // console.log(info, info.allSegs[0].event.extendedProps);
            // default ponašanje: otvara "more" popover.
            // Ako hoćeš da potpuno preuzmeš kontrolu, vrati 'none' u suprotnom 'popover'.
            return 'none';
        },

        onDatesSet(arg) {
            this.title = arg.view?.title || '';
            this.syncSelectedCalendarView(arg.view?.type);
            // arg.view.type => dayGridMonth/timeGridWeek/timeGridDay
            this.$emit('view-change', {
                viewType: arg.view?.type,
                start: arg.start,
                end: arg.end,
                title: arg.view?.title,
            });
        },

        syncSelectedCalendarView(viewName) {
            const selectedView = typeof this.selectedCalendarView === 'string'
                ? this.selectedCalendarView
                : this.selectedCalendarView?.value;

            if (!viewName || selectedView === viewName) {
                return;
            }

            const option = this.calendarViewOptions.find(item => item.value === viewName);
            if (!option) {
                return;
            }

            this.isSyncingCalendarView = true;
            this.selectedCalendarView = option;
            this.$nextTick(() => {
                this.isSyncingCalendarView = false;
            });
        },

        // --- rendering / classes ---
        getEventClassNames(arg) {
            const type = arg.event.extendedProps?.type;
            const ui = type ? this.typeUiMap[type] : null;

            const classes = ['app-calendar__event'];
            if (type) classes.push(`app-calendar__event--${type}`);
            if (ui?.class) classes.push(ui.class);

            return classes;
        },
        
        renderMoreLink(arg) {
            // arg.num = koliko je sakrivenih eventova
            return {
                html: `<span class="app-calendar__more-link">+ još ${arg.num}</span>`
            }
        },

        handleCalendarResize(entries) {
            const width = Math.round(entries[0]?.contentRect?.width || 0);

            if (!width || width === this.calendarWidth) return;

            this.calendarWidth = width;
            cancelAnimationFrame(this.resizeAnimationFrame);
            this.resizeAnimationFrame = requestAnimationFrame(() => {
                this.getApi()?.updateSize();
            });
        },
    },

    watch: {
		selectedCalendarView(newValue, oldValue) {
            if (this.isSyncingCalendarView) {
                return;
            }

            const newView = typeof newValue === 'string' ? newValue : newValue?.value;
            const oldView = typeof oldValue === 'string' ? oldValue : oldValue?.value;

		    if (newView && oldView !== newView) {
                this.changeView(newView)
            }
		},
    },

    mounted() {
        this.syncTitle();

        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(this.handleCalendarResize);
            this.resizeObserver.observe(this.$el);
        }
    },

    beforeUnmount() {
        this.resizeObserver?.disconnect();
        cancelAnimationFrame(this.resizeAnimationFrame);
    },

};
</script>
