# Data table

`KDataTable` wraps DataTables: you give it columns and a data source, it renders, pages, sorts and shows a
spinner while loading. The built-in search box, page-size select and "showing 1 to 10" text are off; you build
those around the table and call its methods. `KDataTablePrint` is a print button that fetches every row from the same endpoint.

```vue
<KDataTable ref="table" :columns="columns" :ajax="{ url: '/employees/datatable', type: 'POST' }" />
```

Blade: `<k-data-table :columns='@json($columns)' :ajax='@json(["url" => "/employees/datatable", "type" => "POST"])'></k-data-table>`.

## KDataTable

### Server-side (default)

Each page change, sort or `reload()` posts to `ajax.url`. Search text, page size and filters go into the
request through the `data` hook (see the page template below). The backend receives the DataTables body plus
your additions and answers with `draw` echoed back, the counts before and after filtering, and the rows keyed by the columns' `data`:

```js
// request
{ draw: 3, start: 20, length: 10, search: { value: 'ana', regex: false }, order: [{ column: 1, dir: 'desc', name: 'email' }],
  columns: [{ data: 'name', name: 'name', searchable: true, orderable: true, search: { value: '', regex: false } }, ...], filters: { ... } }
// response
{ draw: 3, recordsTotal: 120, recordsFiltered: 37, data: [{ id: 1, name: 'Ana', email: 'ana@firma.rs' }] }
```

`start` is the offset, `length` the page size, `order[].column` an index into `columns`. The CSRF
token from `<meta name="csrf-token">` is sent as `X-CSRF-TOKEN` on every request.

Client-side instead: `<KDataTable :data="rows" :columns="columns" :server-side="false" />`. Replace `rows` and
the table redraws; `reload()` does nothing. For a search field pass `:options="{ searching: true }"` (off by default, which also disables the API) and call `getDt().search(text).draw()`.

### Columns and slots

A column is a DataTables column object: `data` (key in the row), `title`, `name` (names the slot and
`order[].name`; `data` does not), optionally `orderable`, `searchable`, `width`, `className`. A column
rendered by a slot takes `data: null` and `orderable: false`.

| Slot | Scope | |
|---|---|---|
| `column-<name>` | `{ rowData, cellData, rowIndex, colIndex, type }` | cell content for the column with that `name` (or `column-<index>`) |
| `header` | – | your own `<tr><th>…</th></tr>` instead of the generated header, for icons or two-line titles |

Wide tables: `:options="{ scrollX: true }"`, plus `top-scroll` for a second scrollbar above the table and
`dark-header` for a dark header row. A header that stays on screen: `:options="{ fixedHeader: { header: true }, scrollX: true }"`; the offset under the mobile header is set for you.

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `columns` | array | required | DataTables column objects |
| `ajax` | object, function | `null` | `{ url, type, data }` or a function; server-side only |
| `data` | array | `[]` | rows for client-side mode |
| `serverSide` | boolean | `true` | |
| `options` | object | `{}` | extra DataTables options merged over the defaults (`fixedHeader`, `scrollX`, `searching`, `language`, `layout`) |
| `locale` | object, string | `''` | `{ dataTable: { zeroRecords, info, infoEmpty, infoFiltered, lengthMenu, processing } }`; empty means Serbian, or the parent's `locale` object when it has one |
| `processing` | boolean | `true` | spinner overlay while loading |
| `sortable` | boolean | `true` | sort by clicking a header |
| `defaultSort` | array | `[]` | initial order, e.g. `[[1, 'desc']]`; empty means first column ascending |
| `pageLength` | number | `10` | rows per page |
| `lengthMenu` | array | `[10, 25, 50, 100]` | page sizes offered to DataTables |
| `topScroll` | boolean | `false` | horizontal scrollbar above the table; attaches to the scroll body, so it needs `scrollX` |
| `darkHeader` | boolean | `false` | dark header row |

`ajax`, `columns`, `serverSide`, `processing`, `sortable` (`ordering`) and `defaultSort` (`order`) win over `options`; `layout` and `language` merge key by key.

### Methods via ref

| Method | What it does |
|---|---|
| `reload(resetPaging = true)` | fetch again; `false` stays on the current page (server-side only) |
| `setPageLength(length, redraw = true)` | change the page size |
| `setOrder(order, redraw = true)` | e.g. `setOrder([[2, 'desc']])` |
| `goToPage(index)` | zero-based |
| `draw(resetPaging = false)` | redraw; re-adjusts the fixed header |
| `getDt()` | the DataTables API object for anything not covered above |

The `ready` event fires once with `{ event, dt }` when the table is initialised; call `getDt()` from there on.

### Page template

Page size, search and the table. `FilterMixin` provides `tableRefs`, `reloadTable`, `handlePerPageChange` and `debounceSearch` even without filters; the panel and `d.filters` are added in [filters.md](filters.md).

```vue
<template>
    <KPageSection title="Employees" icon="icons-3d/employees">
        <template #actions><div class="main-section-header-button"><a href="/employees/create" class="btn btn-primary btn-sm">Add</a></div></template>
        <div class="row mb-4 justify-content-end">
            <div class="col-md-2 mb-2 mb-md-0">
                <KSelect v-model="tableState.perPage" :options="perPageOptions" :object="false" :can-clear="false" :searchable="false" @update:modelValue="handlePerPageChange" />
            </div>
            <div class="col-md-4">
                <div class="input-group input-group-icon-left">
                    <span class="input-group-icon"><k-icon name="search" wrapperClass="icon-sm" /></span>
                    <input v-model="tableState.search" type="text" class="form-control" placeholder="Search" @input="debounceSearch">
                </div>
            </div>
        </div>
        <KDataTable ref="table" :columns="columns" :ajax="ajax" :page-length="initialPageLength">
            <template #column-actions="{ rowData }">
                <button class="btn btn-sm btn-outline-primary border-0" @click="remove(rowData)">Delete</button>
            </template>
        </KDataTable>
    </KPageSection>
</template>

<script>
import axios from 'axios'
import { FilterMixin } from '@kancelarko/ui'

export default {
    mixins: [FilterMixin],
    data() {
        return {
            tableRefs: ['table'],
            initialPageLength: 10,
            tableState: { perPage: 10, search: '' },
            perPageOptions: [10, 25, 50, 100].map(v => ({ value: v, label: String(v) })),
            columns: [
                { data: 'name', title: 'Name', name: 'name' },
                { data: null, title: '', name: 'actions', orderable: false, searchable: false, width: '10%' },
            ],
        }
    },
    computed: {
        ajax() {
            return { url: '/employees/datatable', type: 'POST', data: (d) => {
                d.search.value = this.tableState.search
                d.length = Number(this.tableState.perPage) || this.initialPageLength
                return d
            } }
        },
    },
    methods: {
        async remove(row) {
            const res = await this.$alert.confirm({ title: 'Delete this employee?', confirmText: 'Delete', cancelText: 'Cancel' })
            if (!res.isConfirmed) return
            await axios.delete(`/employees/${row.id}`)
            this.reloadTable(false)   // stay on the current page
        },
    },
}
</script>
```

## KDataTablePrint

A print button. On click it posts to `requestUrl` in the DataTables format, asking for all rows with the
current search, filters and sort order, renders a plain table in a section teleported to `body` (landscape,
visible only while printing) and calls `window.print()`. Empty results and errors go through `this.$alert.error`, so the plugin and `axios` are required.

```vue
<KDataTablePrint title="Employees" print-label="Print" preparing-label="Preparing..." :columns="printColumns" :metadata="printMetadata"
    request-url="/employees/datatable" :request-columns="columns" :request-filters="appliedFilters"
    :search="tableState.search" :get-data-table="() => $refs.table?.getDt()" no-data-message="Nothing to print." error-message="Print failed.">
    <template #cell-positions="{ row }"><div v-for="p in row.positions" :key="p.id">{{ p.name }}</div></template>
</KDataTablePrint>
```

```js
printColumns: [
    { key: 'name', label: 'Name' },
    { key: 'active', label: 'Status', formatter: row => row.active ? 'Active' : 'Inactive' },
    { key: 'positions', label: 'Positions' },
],
printMetadata: [{ key: 'count', label: 'Rows:', value: rows => rows.length }],
```

The body is `{ draw: 1, start: 0, length: requestLength, search: { value }, order: [{ column, dir }], columns: [{ data, name }], filters, ...extraRequestData }`;
`order` comes from `getDataTable().order()` when given, otherwise `defaultOrder`. Only `data` from the response
is printed. Pass `appliedFilters` in the shape the backend expects, the same object you put in `d.filters`.

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | string | required | heading on paper |
| `printLabel`, `preparingLabel` | string | required | button text, idle and while fetching |
| `buttonClass` | string, array, object | `btn btn-outline-primary border-0` | |
| `columns` | array | required | `{ key, label, formatter?, fallback? }`; a cell is `formatter(row)`, else `row[key]`, else `fallback`, else `/` |
| `metadata` | array | `[]` | `{ key, label?, value?, visible?, type?, checked? }` lines above the table; `value` may be a function of all rows; `type: 'checkbox'` draws a box with `checked` |
| `rowKey` | string, function | `'id'` | row key, or `(row, index) => key` |
| `requestUrl` | string | required | |
| `requestColumns` | array | required | the table's `columns`, so the backend can order |
| `requestFilters`, `extraRequestData` | object | `{}` | sent as `filters` / merged into the body |
| `search` | string | `''` | sent as `search.value` |
| `getDataTable` | function | `null` | returns the DataTables API; the print copies its current order |
| `defaultOrder` | array | `[[0, 'asc']]` | order when `getDataTable` is not given |
| `requestLength` | number | `9999` | |
| `noDataMessage`, `errorMessage` | string | required | alert text |

### Slots

| Slot | Scope | |
|---|---|---|
| `trigger` | `{ print, preparing }` | your own button |
| `cell-<key>` | `{ row, column, value }` | cell content for that column |
| `meta-<key>` | `{ item, rows, value }` | a metadata line (not for `type: 'checkbox'`) |
