# Select

Dropdowns on `@vueform/multiselect`: `KSelect` takes an options array, `KSelectAsync` fetches them from your endpoint while the user types. Everything else is shared.

## KSelect

Dropdown with search, a floating label, inline error text and chips for multiple values.

```vue
<KSelect v-model="form.city" :options="cities" label="name" track-by="name" value-prop="id" floating-label="City" :error="errors.city" />
```

In Blade: `<k-select v-model="form.city" :options='@json($cities)' label="name" track-by="name" value-prop="id"></k-select>`.

### Mode and value

- `single`: the field shows the selected option; `v-model` is one option or `null`.
- `multiple`: the field shows `1 option selected` / `N options selected` (library text, English); `v-model` is an array.
- `tags`: chips with a ×; `v-model` is an array.

Start `multiple` and `tags` with `[]`. With `object` on (the default) the model holds the whole
option, `{ id: 1, name: 'Beograd' }`; with `:object="false"` it holds `valueProp` only, `1`.

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | any | `null` | `v-model`; array in `multiple`/`tags` |
| `options` | array | `[]` | objects or plain strings |
| `mode` | string | `single` | `single`, `multiple`, `tags` |
| `label` | string | `label` | option field shown to the user |
| `trackBy` | string, array | `value` | option field(s) the search matches on |
| `valueProp` | string | `value` | option field used as the value |
| `object` | boolean | `true` | model holds the whole option instead of `valueProp` |
| `searchable` | boolean | `true` | |
| `placeholder` | string | `''` | |
| `floatingLabel` | string | `''` | floating label, hidden when empty |
| `disabled` | boolean | `false` | |
| `canClear` | boolean | `true` | × that clears the whole selection |
| `clearOnSearch` | boolean | `false` | passed to the library; no visible effect with a static list |
| `closeOnSelect` | boolean | `true` | close the list after a pick |
| `hideSelected` | boolean | `true` | selected options disappear from the list |
| `limit` | number | `-1` | max options rendered; `-1` is all |
| `noOptionsText` | string | `Nema opcija.` | empty list text |
| `noResultsText` | string | `Nema rezultata.` | no search hits text |
| `classes` | object | `null` | overrides the library's CSS class map |
| `tagRemovable` | boolean | `true` | chips get a × in `tags` mode |
| `tagRemoveIcon` | string | `close` | icon on that × |
| `error` | string, boolean | `''` | message below the field; `true` for a red border only |
| `sizeSM` | boolean | `false` | smaller field |
| `showOptionCheckbox` | boolean | `false` | checkbox in front of every option |
| `lightBackground` | boolean | `false` | lighter field background, for use on dark cards |

### Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue`, `change` | new value | the selection changed |
| `select`, `deselect` | `{ option, id }` | one option picked or removed |
| `search-change` | string | the user typed in the search |
| `open`, `close`, `clear` | – | list opened, list closed, × clicked |

### Slots

| Slot | Scope | What it does |
|---|---|---|
| `option` | `{ option, isSelected(option) }` | one row in the list |
| `singlelabel` | `{ value }` | the selected option in `single` mode |
| `tag` | `{ option, handleTagRemove(option, $event), disabled }` | one chip in `tags` mode |
| `nooptions`, `noresults` | – | empty states |

### Notes

- Objects shaped `{ id, name }` need `label="name" track-by="name" value-prop="id"`. Without `trackBy` the search looks at `value`, which does not exist, and finds nothing. With plain strings leave all three alone.
- In `single` mode with `:can-clear="false"` clicking the selected option again does not deselect it.
- `showOptionCheckbox` only makes sense with `:hide-selected="false"`; otherwise the checked rows vanish from the list.
- An option with `disabled: true` cannot be picked, and its chip has no ×.

## KSelectAsync

Same dropdown, options come from `resolveOptions`. Search is debounced, a spinner shows while waiting, and responses that arrive out of order are dropped.

```vue
<KSelectAsync v-model="form.company" :resolve-options="searchCompanies" label="name" track-by="name" value-prop="id" :min-chars="2" />
```

```js
methods: {
    async searchCompanies(query) {
        const { data } = await axios.get('/api/companies', { params: { q: query } })
        return data.items   // must be an array
    }
}
```

`resolveOptions(query)` gets the trimmed search text and returns a Promise of an options array. It is called with `''` on mount and on open
(when `preload` is on and `minChars` is `0`), and `delay` ms after the last keystroke once the query reaches `minChars`. A rejected Promise leaves the list empty, silently.

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | any | `null` | `v-model`; array in `multiple`/`tags` |
| `resolveOptions` | function | required | `(query) => Promise<array>` |
| `minChars` | number | `0` | shortest query that triggers a call |
| `delay` | number | `250` | debounce in ms |
| `preload` | boolean | `true` | load with `''` on mount and on open; only when `minChars` is `0` |
| `placeholder` | string | `Izaberi...` | |

`mode`, `label`, `trackBy` (string only), `valueProp`, `object`, `searchable`, `disabled`, `canClear`, `clearOnSearch`,
`closeOnSelect`, `limit`, `noOptionsText`, `noResultsText` and `classes` work as in KSelect, same defaults.

### Notes

- Events: as KSelect, plus `options-loaded` with the array that just arrived.
- Slots: as KSelect, plus `multiplelabel` with `{ values }` for the collapsed text in `multiple` mode (default: the label for one value, `N izabrano` for more).
- No `floatingLabel`, `error`, `sizeSM`, `lightBackground`, `hideSelected` or `showOptionCheckbox` here.
- Chips in `tags` mode have no ×. Provide a `#tag` slot and call `handleTagRemove(option, $event)` if you need per-chip removal.
- An initial value that is not in the loaded list still renders, because with `object` on the model already carries the whole option.
