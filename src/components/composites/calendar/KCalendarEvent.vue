<template>
    
    <div v-if="event" class="app-calendar__event-content" :class="eventClass" >
        <div class="app-calendar__event-icon">
            <k-icon
                v-if="iconName"
                :name="iconName"
                wrapperClass="icon-event"
            />
        </div>

        <span class="app-calendar__event-title">
            {{ eventTitle }}
        </span>
    </div>
   
    
</template>

<script>
    
    import { getCalendarTypeUiMap } from './calendar-type-ui-map';

    /* ova komponenta sluzi za prikaz eventova u vidu "tračica" - prikaz u modalu za sve evenotove na dati dan + vidljivo u celijiama (kvadrat za dan) */
    export default {
        name: "KCalendarEvent",
        
        props: {
            /* FullCalendar EventApi (arg.event) */
            event: {
                type: Object,
                default: null,
            },
        },

        data() {
            return {
                typeUiMap: getCalendarTypeUiMap()
            }
        },

        methods: {
            
        },
        computed: {
            eventType() {
                return this.event?.extendedProps?.type ?? null;
            },
            eventTitle() {
                return this.event?.title ?? '';
            },  
            eventClass() {
                return this.eventType ? `app-calendar__event--${this.eventType}` : '';
            },
            iconName() {
                // 1) ako si poslao ikon u sam event:
                const direct = this.event?.extendedProps?.icon;
                if (direct) return direct;

                // 2) preko typeUiMap:
                const ui = this.eventType ? this.typeUiMap?.[this.eventType] : null;
                return ui?.icon ?? null;
            },
        }
    }
</script>
