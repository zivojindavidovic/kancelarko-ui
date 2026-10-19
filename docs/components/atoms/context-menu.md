# KContextMenu

Dropdown menu opened from any trigger: a button, an icon, a right click. You supply the trigger and the items; it handles opening, closing and positioning.

```vue
<KContextMenu>
    <template #trigger="{ toggle }">
        <button type="button" class="btn p-0" @click.stop="toggle">
            <k-icon name="menu" wrapperClass="icon-sm" />
        </button>
    </template>

    <template #default="{ close }">
        <button class="dropdown-item" @click="edit(row); close()">Edit</button>
        <button class="dropdown-item" @click="print(row); close()">Print</button>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item text-danger" @click="remove(row); close()">Delete</button>
    </template>
</KContextMenu>
```

In Blade: `<k-context-menu>` with the same two slots.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `offsetX` | number | `0` | horizontal shift from the trigger's left edge, px |
| `offsetY` | number | `6` | gap between trigger and menu, px |
| `minWidth` | number, string | `240` | number is px; a string is used as is (`'100%'`, `'20rem'`) |
| `closeOnScroll` | boolean | `true` | close on scroll; with `false` the menu follows the trigger instead |
| `teleport` | boolean | `true` | render the menu in `teleportTo` instead of next to the trigger |
| `teleportTo` | string | `body` | teleport target selector |
| `fullWidth` | boolean | `false` | trigger wrapper becomes `d-block w-100` instead of `d-inline-block` |

## Events

| Event | Payload | When |
|---|---|---|
| `open` | – | the menu opened |
| `close` | – | the menu closed: outside click, Escape, scroll, another menu opening, or `close()` |

## Slots

| Slot | Scope | What it does |
|---|---|---|
| `trigger` | `{ toggle, open, close, isOpen }` | the element that opens the menu |
| default | `{ close, isOpen }` | menu items, usually `<button class="dropdown-item">` |

## Example

Right click, and a trigger that shows the open state:

```vue
<KContextMenu :offset-y="0" @open="selected = row">
    <template #trigger="{ open, isOpen }">
        <div class="p-3" :class="{ active: isOpen }" @contextmenu.prevent="open">{{ row.name }}</div>
    </template>
    <template #default="{ close }">
        <button class="dropdown-item" @click="copy(row); close()">Copy</button>
    </template>
</KContextMenu>
```

## Notes

- Clicking an item does not close the menu. Call `close()` after the action, or skip it to keep the menu open (checkboxes).
- Only one `KContextMenu` is open at a time; opening another closes the previous one.
- Position is `fixed` with `z-index: 1080`, below the trigger and left-aligned, never at the mouse position. It flips above or right-aligns when it would leave the viewport, and re-positions on resize.
- The menu is a Bootstrap `dropdown-menu`; `dropdown-item`, `dropdown-divider` and `dropdown-header` work inside.
- With `teleport` on, the menu is not a DOM child of your component, so the parent's `scoped` CSS does not reach the items.
- `@click.stop` on the trigger keeps a table row's own click handler from firing.
