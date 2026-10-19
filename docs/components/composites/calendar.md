# Calendar

`KCalendar` wraps FullCalendar (month / week / day) in the Kancelarko toolbar: year and period arrows,
title, view select, filter icon. It renders whatever you put in `events`; fetching is yours.
`KCalendarEvent` is the chip drawn for each event, also usable on its own for a "+ N more" list.

```vue
<KCalendar ref="calendar" :events="events" @view-change="load" @event-click="open" />
```

In Blade: `<k-calendar :events="events" @view-change="load"></k-calendar>`.

## Loading events

`view-change` fires on mount and after every navigation or view switch, with the visible range.
Fetch that range from your endpoint and assign the result; the calendar re-renders on its own.

```js
data() {
    return { events: [] }
},
methods: {
    async load({ start, end }) {
        const { data } = await axios.get('/api/calendar', { params: { from: start.toISOString(), to: end.toISOString() } })
        this.events = data
    },
    open({ event }) {
        this.$refs.eventModal.show(event.id, event.extendedProps)
    },
},
```

`start` and `end` are Date objects; `end` is exclusive. In month view the range includes the leading and trailing days of the neighbouring months.

## Event shape

A FullCalendar event. `type` and `icon` live in `extendedProps`, next to anything you need on click:

```js
{
    id: 'bday-12',
    title: 'Birthday – Petar Petrović',
    start: '2026-02-06',              // or '2026-02-06T09:00:00'
    end: '2026-02-06',                // optional
    allDay: true,                     // optional
    extendedProps: {
        type: 'birthday',             // colour + icon, table below
        icon: 'mail',                 // optional, wins over the type icon
        employeeId: 12,
    },
}
```

## Types

`getCalendarTypeUiMap()` (exported from `@kancelarko/ui`) returns the built-in `{ type: { class, icon } }`:

| `type` | class | icon | `type` | class | icon |
|---|---|---|---|---|---|
| `birthday` | `is-birthday` | `birthday` | `reminder` | `is-reminder` | `time` |
| `slava` | `is-slava` | `saint` | `holiday` | `is-holiday` | `calendar` |
| `epostar` | `is-epostar` | `mail` | `invoice` | `is-invoice` | `invoice` |
| `note` | `is-note` | `notes` | `jubilee` | `is-jubilee` | `benefits` |
| `task` | `is-task` | `circle` | `resource` | `is-resource` | `resources` |
| `document` | `is-document` | `file` | `kadrovik` | `is-kadrovik` | `kadrovik` |

Every event element gets `app-calendar__event` and `app-calendar__event--<type>`; the library colours
hang off the second one. The `is-*` class is added as well but has no styles of its own. A type outside
the map still gets its `--<type>` class, so `{ type: 'meeting', icon: 'group' }` plus
`.app-calendar__event--meeting { background: ... }` in your stylesheet is all a custom type needs.

## KCalendar

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `events` | array | `[]` | events in the shape above; assign a new array to refresh |
| `initialView` | string | `dayGridMonth` | `dayGridMonth`, `timeGridWeek` or `timeGridDay` |
| `dayMaxEvents` | number, boolean | `3` | chips per day before "+ još N"; `false` shows all |
| `firstDay` | number | `1` | first weekday, `1` Monday, `0` Sunday |
| `weekends` | boolean | `true` | show Saturday and Sunday |
| `filtersOpen` | boolean | `false` | your filter panel is open; lifts the filter icon above it |
| `rootClass` | string, array, object | `''` | extra class on the wrapper |
| `typeUiMap` | object | built-in map | `{ type: { class, icon } }`; only `class` is used |
| `locale` | string, object | `sr` | currently no effect |
| `showToolbar` | boolean | `true` | currently no effect |
| `enableMonthView`, `enableWeekView`, `enableDayView` | boolean | `true` | currently no effect |

### Events

| Event | Payload | When |
|---|---|---|
| `event-click` | `{ event, el, jsEvent, view }` | a chip was clicked; `event` is the FullCalendar EventApi (`id`, `title`, `start`, `extendedProps`) |
| `date-click` | `{ date, dateStr, jsEvent, view, clientX, clientY, pageX, pageY }` | an empty cell was clicked; coordinates for a context menu |
| `more-link-click` | FullCalendar info: `date`, `allSegs`, `hiddenSegs`, `jsEvent`, `view` | "+ još N" was clicked; the built-in popover is off, you show the list |
| `view-change` | `{ viewType, start, end, title }` | on mount and after every navigation or view switch |
| `filter-click` | – | the filter icon was clicked |

### Slots

| Slot | Scope | |
|---|---|---|
| `filters` | – | between the toolbar and the grid; `v-show` your filter panel here, toggle it on `filter-click`, mirror the state into `filtersOpen` |

### Methods via ref

| Method | What it does |
|---|---|
| `getApi()` | the FullCalendar API (`getEvents()`, `gotoDate()`, `incrementDate()`, ...) |
| `prev()`, `next()` | previous / next period |
| `prevYear()`, `nextYear()` | one year back / forward |
| `today()` | jump to today |
| `changeView(name)` | switch view; the toolbar select follows |
| `setDate(date)` | jump to a date (string or Date) |
| `refetchEvents()` | FullCalendar `refetchEvents()`; with a plain `events` array just assign a new one |

## KCalendarEvent

Icon + title, coloured by `extendedProps.type`. `KCalendar` renders it for every event; use it yourself
to list a day's events after `more-link-click`:

```js
showDay(info) {
    const day = info.date.toDateString()
    this.dayEvents = this.$refs.calendar.getApi().getEvents().filter(e => e.start.toDateString() === day)
    this.dayModalOpen = true
},
```

```vue
<div v-for="e in dayEvents" :key="e.id" class="app-calendar__event" :class="`app-calendar__event--${e.extendedProps.type}`">
    <KCalendarEvent :event="e" />
</div>
```

| Prop | Type | Default | What it does |
|---|---|---|---|
| `event` | object | `null` | FullCalendar EventApi, or any object with `title` and `extendedProps`; renders nothing when null |

The chip carries only `app-calendar__event-content`; the background sits on `.app-calendar__event.app-calendar__event--<type>`, hence the wrapper.

## Notes

- Language (day names, "All day") comes from `window.appLocale`: `rs`, `rs_cyr`, `hr`, `ba`, `ba_cyr`, `cg`, `cg_cyr`, `en`. Set it before the app mounts; the `locale` prop is ignored.
- The view select ("Mesečni / Nedeljni / Dnevni") and the "+ još N" link stay Serbian whatever the locale.
- The icon comes from `extendedProps.icon`, then from the built-in map. `typeUiMap` changes only the CSS class; for a custom type put `icon` in the event.
- `showToolbar`, `enableMonthView`, `enableWeekView` and `enableDayView` are declared, but the custom toolbar always shows all three views.
- Height is `auto`, width follows the parent (a ResizeObserver calls `updateSize()`). Drag and resize of events is off.
