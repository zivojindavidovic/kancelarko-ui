# Filters

`FilterMixin` holds the state and reloads the table, `KFilterPanel` is where the user edits filters and
clicks Apply, `KFilterPreview` shows the applied ones as pills with an × each. The user edits `draftFilters`
in the panel; nothing reaches the table until Apply copies them into `appliedFilters` and reloads it. Cancel
drops the edits, Reset puts both back to `getInitialFilters()`. The rest of the page is in [datatable.md](datatable.md).

```vue
<template>
    <div class="main-section-filter-icon" @click="showFilters = !showFilters"><k-icon name="filter" wrapperClass="k-icon icon-md" /></div>
    <KFilterPanel v-show="showFilters" v-model="draftFilters" @apply="handleApply" @reset="handleReset" @cancel="showFilters = false">
        <template #default="{ filters }">
            <div class="row">
                <div class="col-md-4"><KSelect v-model="filters.department" :options="departments" label="name" value-prop="id" floating-label="Department" /></div>
                <div class="col-md-4"><KDatePicker v-model="filters.from" placeholder="From" /></div>
                <div class="col-md-4"><KCheckbox v-model="filters.activeOnly" label="Active only" /></div>
            </div>
        </template>
    </KFilterPanel>
    <KFilterPreview v-show="showPreview" :filters="appliedFilters" :labels="{ department: 'Department', from: 'From', activeOnly: 'Active only' }"
        @remove-filter="handleRemoveFilter" @clear-all="handleClearAll" />
    <KDataTable ref="table" :columns="columns" :ajax="ajax" />
</template>

<script>
import { FilterMixin, toSqlDate } from '@zivojindavidovic/ui'

export default {
    mixins: [FilterMixin],
    data() {
        return {
            draftFilters: this.getInitialFilters(),
            appliedFilters: this.getInitialFilters(),
            tableRefs: ['table'], filterStorageKey: 'employees-filters',
            filterSerializer: f => ({ ...f, from: f.from?.toISOString() ?? null }),
            filterDeserializer: f => ({ ...f, from: f.from ? new Date(f.from) : null }),
            departments: [{ id: 1, name: 'Sales' }, { id: 2, name: 'Support' }],
            columns: [{ data: 'name', title: 'Name', name: 'name' }, { data: 'department', title: 'Department', name: 'department' }],
        }
    },
    computed: {
        ajax() {
            return { url: '/employees/datatable', type: 'POST', data: (d) => {
                d.filters = {
                    department: this.appliedFilters.department?.id ?? null,
                    from: toSqlDate(this.appliedFilters.from),
                    activeOnly: this.appliedFilters.activeOnly,
                }
                return d
            } }
        },
    },
    methods: {
        getInitialFilters() {
            return { department: null, from: null, activeOnly: false }
        },
    },
}
</script>
```

## FilterMixin

`getInitialFilters()` is the one method the page must write: every key with its empty value, `null`
for a select or date, `false` for a checkbox, `[]` for a multi-select. The rest comes from the mixin.

| Data | Type | Default | What it does |
|---|---|---|---|
| `draftFilters` | object | `{}` | what the panel edits |
| `appliedFilters` | object | `{}` | what the table and the preview use |
| `showFilters` | boolean | `false` | panel visible |
| `showPreview` | boolean | `false` | preview visible; set by `handleApply` and on mount |
| `tableRefs` | array | `[]` | refs of the `KDataTable`s to reload |
| `treeRefs` | array | `[]` | refs of `KTree`s whose `clearSelection()` runs on reset |
| `filterStorageKey` | string | `null` | localStorage key; nothing is stored without it |
| `filterSerializer` | function | `null` | `filters => object`, runs before saving (Date to string) |
| `filterDeserializer` | function | `null` | `object => filters`, runs after loading (string to Date) |

| Method | What it does |
|---|---|
| `handleApply(filters)` | clones into `appliedFilters`, shows the preview, reloads; bind to the panel's `@apply` |
| `handleReset()` | both states back to `getInitialFilters()`, clears storage and trees, reloads; `@reset` |
| `handleRemoveFilter({ key, item })` | drops one key (`false` for booleans, `null` otherwise) or one item of an array, matched by `id`; updates both states, reloads; `@remove-filter` |
| `handleClearAll()` | same as `handleReset()`; `@clear-all` |
| `hasFilters()` | `true` when any applied value is not `null`, `false`, `''` or `[]` |
| `reloadTable(resetPaging = true)` | calls `reload()` on every ref in `tableRefs` |
| `handlePerPageChange(value)` | writes `tableState.perPage` and calls `setPageLength` on the tables; the page defines `tableState`, `initialPageLength` is the fallback, then 10 |
| `debounceSearch()` | reloads 500 ms after the last call; bind to `@input` of the search field |
| `saveFiltersToStorage(filters)` | writes to localStorage through `filterSerializer` |
| `loadFiltersFromStorage()` | reads through `filterDeserializer`; `null` when nothing is stored |
| `safeClone(value)` | deep copy that keeps Date instances; what the mixin uses for both states |

There is no cancel handler. Bind `@cancel="showFilters = false"`; the panel discards its edits itself.

### localStorage

On mount, when `filterStorageKey` is set and something is stored, it is loaded into both states and the
preview opens. Apply does not save: call `saveFiltersToStorage(filters)` yourself, for example from a Save
button in the panel's `actions` slot. `handleReset()` removes the key. Dates do not survive JSON, so give
`filterSerializer` and `filterDeserializer` as in the example above.

## KFilterPanel

The fields and three buttons. The default slot gets a deep copy of `modelValue`: edit it freely, Apply emits the copy, Cancel throws it away.

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | object | required | `v-model`, the draft filters |
| `showReset`, `showCancel`, `showApply` | boolean | `true` | show each button |

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | filters copy | Apply |
| `apply` | filters copy | Apply, right after `update:modelValue` |
| `reset` | – | Reset; the panel changes nothing itself |
| `cancel` | – | Cancel, after the copy is restored from `modelValue` |

| Slot | Scope | |
|---|---|---|
| default | `{ filters }` | the fields |
| `actions` | `{ onApply, onCancel, onReset, filters }` | your buttons instead of the built-in three |

Button text is Serbian (`Resetuj`, `Odustani`, `Potvrdi`). Override with
`:locale="{ resetuj: 'Reset', odustani: 'Cancel', potvrdi: 'Apply' }"` or a `generalLocale` object on the parent.

## KFilterPreview

The applied filters as pills, one row per key, with an eye icon that collapses the list, a clear-all
link and a button per row. Hidden when nothing is applied.

| Prop | Type | Default | What it does |
|---|---|---|---|
| `filters` | object | required | the applied filters |
| `labels` | object | `{}` | row title per key; the key itself otherwise |
| `formatters` | object | `{}` | `value => string` per key; called once per item for arrays |

| Event | Payload | When |
|---|---|---|
| `remove-filter` | `{ key }` or `{ key, item }` | × on a pill or the row button |
| `clear-all` | – | the clear-all link in the header |

How a value turns into pills: an array gives one pill per item; `true` gives one pill reading "Da", `false`
none; a Date goes through `toLocaleDateString('sr-RS')`; an object shows the first of `name`, `title`, `value`, `label`
it has; strings and numbers as they are. `null`, `''` and `[]` are skipped. Texts (`rezultatFiltera`, `obrisiSve`, `da`) are overridden like the panel's.

## Notes

- Send `appliedFilters` to the backend, never `draftFilters`, converted to what it expects.
- `KSelect` puts the whole option object into the model by default. Build options as `{ id, name }`: the pill shows `name`, `handleRemoveFilter` matches by `id`.
- Trees: when the key is `selectedEmployees` and items carry `nodeId`, removing a pill also calls `deselectById(nodeId)` on each ref in `treeRefs`.
