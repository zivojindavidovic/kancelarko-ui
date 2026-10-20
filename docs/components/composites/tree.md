# Tree

`KTree` is a checkbox tree with search: organisation structure, employees by sector, anything with parents
and children. Selection lives inside the component; you read it through `update:selected` or a ref.
`KTreeNode` is one row, rendered for you. `buildTreeStructure` nests the flat list your endpoint returns.

```vue
<KTree ref="tree" :data="nodes" :is-loading="loading" :config="{ showCheckbox: true, searchable: true, checkboxMode: 'auto' }"
    @update:selected="ids => selected = ids" />
```

In Blade: `<k-tree :data="nodes" @update:selected="onSelect"></k-tree>`.

## Node shape

```js
nodes: [
    { id: '1', label: 'Company', icon: 'company', children: [
        { id: '2', label: 'Sales', icon: 'sector' },
        { id: '3', label: 'Procurement', icon: 'sector', disabled: true },
    ] },
]
```

| Key | Type | What it does |
|---|---|---|
| `id` | string, number | unique (required) |
| `label` | string | text; search matches against it (required) |
| `icon` | string | `<k-icon>` name |
| `children` | array | nested nodes |
| `disabled` | boolean | greyed out, cannot be checked; inherited by the subtree unless `propagateDisabled: false` |
| `selectionDisabled` | boolean | disables the checkbox on this node only |
| `orig_data` | object | your original record, returned by `getSelectedNodesWithOriginalData()` |

## Where the nodes come from

Your endpoint usually returns a flat list (`id` + `parent`). `buildTreeStructure(orgTree, employees, options)`
nests it and, on request, hangs employees under their unit:

```js
import { buildTreeStructure } from '@zivojindavidovic/ui'

async mounted() {
    this.loading = true
    const { data } = await axios.get('/api/org-tree')
    this.nodes = buildTreeStructure(data.units, data.employees, { includeEmployees: true })
    this.loading = false
    this.$refs.tree.selectByIds(['12', 'emp_7_obj_12'])    // restore a saved selection
},
methods: {
    async save() {
        const { employees } = this.$refs.tree.getSelectedNodesWithOriginalData()
        await axios.post('/api/permissions', { employees: employees.map(e => e.ID) })
    },
},
```

| Argument | What it is |
|---|---|
| `orgTree` | rows with `id`, `parent` (`'#'`, `null` or missing = root), `text` or `label`; optional `icon`, `li_attr.typeIcon`, `object` (unit id employees attach to), `orig_data` |
| `employees` | rows with `ID`, `objectID`, `firstname`, `lastname`, optional `archived`; default `[]` |
| `options.includeEmployees` | `false`; add employees as children of their unit |
| `options.includeArchived` | `false`; keep employees whose `archived` is not `0` |
| `options.includeSupervisor` | `false`; disable employees whose `ID` is not in `employeeUnderSupervision` |
| `options.employeeUnderSupervision` | `[]`; employee ids a supervisor may pick; required with `includeSupervisor` |
| `options.hideExternal` | `false`; drop employees whose unit is not in the list (otherwise they land in the root) |

Unit ids become strings (`'12'`), employees get `'emp_<ID>_obj_<objectID>'`, icons follow the type (`company`, `sector`, `work-place`, `profile-without-circle`) and the source row is kept in `orig_data`.

## KTree

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `data` | array | required | nodes |
| `config` | object | `{ showCheckbox: true, searchable: true, checkboxMode: 'single' }` | behaviour, keys below; replaces the default, no merge |
| `searchPlaceholder` | string | `Pretraži...` | |
| `isLoading` | boolean | `false` | spinner overlay |
| `loadingLabel` | string | `Učitavanje...` | screen-reader text of the spinner |
| `loadingDataLabel` | string | `Učitavanje podataka...` | text under the spinner |
| `noResultsLabel` | string | `Nema rezultata` | shown when search finds nothing |
| `noPadding` | boolean | `false` | removes padding on `.tree-container` |
| `wrapperClass` | string | `''` | extra classes on the wrapper |
| `title` | string | `Tree View` | currently not rendered |
| `showHeader` | boolean | `true` | currently no effect |

`config` keys:

| Key | Default | What it does |
|---|---|---|
| `showCheckbox` | `true` | `false` gives a read-only tree |
| `searchable` | `true` | search field above the tree |
| `checkboxMode` | `single` | `auto`, `single` or `manual` |
| `singleSelect` | unset | only one node checked at a time |
| `exclusiveHierarchySelection` | unset | checking a node unchecks its ancestors and descendants |
| `propagateDisabled` | `true` | a parent's `disabled` applies to its subtree |

`auto`: checking a parent checks every enabled descendant and expands the branch; a parent shows checked
when all its enabled children are, indeterminate when some are. `single`: checking a parent greys out its
descendants (whole sector or individual people, not both). `manual`: every node on its own.

Event `update:selected`: the array of checked ids, after every change from a click or a method.

### Methods via ref

| Method | What it does |
|---|---|
| `getSelectedNodes()` | ids of checked nodes |
| `getSelectedNodesWithOriginalData()` | `{ nodes, employees }` with `orig_data`; `emp_*` nodes go to `employees`, including those under a checked unit |
| `getSelectedEmployeesWithOriginalData()` | `orig_data` of directly checked `emp_*` nodes only |
| `selectById(id)` | check one node as if clicked (mode rules apply) and expand the path to it |
| `selectByIds(ids, { expandSelected = false, emitUpdate = true })` | check many at once and expand the path to each; `expandSelected` opens the nodes themselves; `emitUpdate: false` skips `update:selected` |
| `deselectById(id)` | uncheck one node |
| `selectAll()` / `deselectAll()` | check everything enabled and expand all / uncheck everything |
| `clearSelection()` | uncheck everything and collapse the tree |
| `expandAll()` / `collapseAll()` | |
| `expandPathToNode(id)` | open every ancestor; the node itself stays closed |
| `disableNode(ids, cascade = true)` / `enableNode(ids, cascade = true)` | grey out / restore one id or a list; `cascade: false` leaves children alone |
| `disableAllNodes()` / `enableAllNodes()` | |

## KTreeNode

One row. You need it only when building your own tree around it.

| Prop | Type | Default | What it does |
|---|---|---|---|
| `node` | object | required | |
| `selected` | array | `[]` | checked ids |
| `disabled` | boolean | `false` | |
| `propagateDisabled` | boolean | `true` | pass `disabled` to children |
| `searchQuery` | string | `''` | highlights a matching label |
| `forceExpand` | boolean | `false` | declared, no effect |
| `expandedMap` | object | `{}` | shared `{ id: true }` of open nodes |
| `bulkExpanding` | boolean | `false` | turns the expand animation off |
| `options` | object | `{ showCheckbox: true }` | same keys as `config` |
| `disabledIds` | Set | `new Set()` | ids greyed out in `single` mode |

Event `select`: `{ id, selected, disabledChildren }`, or `{ ids, selected, bulk: true }` for a parent in `auto` mode.

## Notes

- No `v-model:selected`. Listen to `update:selected` or call `getSelectedNodes()`.
- `config` replaces the default object. Pass `showCheckbox`, `searchable` and `checkboxMode` every time; a missing `checkboxMode` makes the rows behave as `auto`.
- Ids from `buildTreeStructure` are strings. `selectByIds([12])` finds nothing; pass `['12']`.
- Search matches `label` only, opens the parents of every hit and highlights the row. Clearing the search collapses the tree. Double-click on a row toggles its children.
- Disabled nodes are skipped by `selectAll()` and by `auto` cascading. In `auto` mode a parent whose children are all disabled becomes disabled itself.
- `selectByIds` adds ids as they are: `singleSelect` and the `single`-mode greying of descendants are not applied. `selectById` applies them.
