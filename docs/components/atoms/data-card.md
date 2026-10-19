# KDataCard

Grey card with label/value rows and a place for actions (edit, delete, download). Shows one record: an address, a bank account, a contract.

```vue
<KDataCard :rows="rows">
    <template #actions>
        <button type="button" class="btn p-0" @click="edit(address)">
            <k-icon name="edit" wrapperClass="icon-sm" />
        </button>
        <button type="button" class="btn p-0" @click="remove(address)">
            <k-icon name="delete" wrapperClass="icon-sm red-icon" />
        </button>
    </template>
</KDataCard>
```

```js
computed: {
    rows() {
        return [
            { key: 'street', label: 'Street', value: this.address.street },
            { key: 'city', label: 'City', value: this.address.city },
            { key: 'zip', label: 'Postal code', value: this.address.zip },
        ]
    }
}
```

In Blade: `<k-data-card :rows='@json($rows)'></k-data-card>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `rows` | array | `[]` | `{ key, label, value }` per row; `key` must be unique, `value` may be left out |
| `actionsPosition` | string | `top` | `top` above the rows (right-aligned), `inline` to the right of all rows, `row` a third column in every row |

## Slots

| Slot | Scope | What it does |
|---|---|---|
| `actions` | – | card-level buttons; rendered with `top` and `inline` only |
| `label` | `{ row }` | replaces the label of every row |
| `value` | `{ row }` | replaces the value of every row |
| `row-actions` | `{ row }` | per-row buttons; only with `actions-position="row"` |
| default | – | replaces the rows entirely; `top` actions still render |

## Example

Link in one value, actions beside the rows:

```vue
<KDataCard :rows="rows" actions-position="inline">
    <template #value="{ row }">
        <a v-if="row.key === 'bank'" href="#" @click.prevent="openBank(account)">{{ row.value }}</a>
        <template v-else>{{ row.value }}</template>
    </template>
    <template #actions>
        <button type="button" class="btn p-0" @click="edit(account)">
            <k-icon name="edit" wrapperClass="icon-sm" />
        </button>
    </template>
</KDataCard>
```

## Notes

- Rows are separated by a divider, none after the last one. Values are right-aligned and wrap when long.
- A `null` or `undefined` value renders as empty; no need to filter rows.
- With the default slot, `rows` and `inline` actions are ignored.
- With `actions-position="row"` the `actions` slot is not rendered.
- The card is full width of its parent. Stack several with `class="mb-3"`.
