# KInfoBox

Small grey block with an icon on the left and a short message next to it, for notes and hints in modals and cards.

```vue
<KInfoBox class="mb-3">
    Attach the medical documentation within 3 days of the first day of absence.
</KInfoBox>
```

In Blade: `<k-info-box class="mb-3">...</k-info-box>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `iconName` | string | `info` | icon name passed to `<k-icon>` |
| `boxClass` | string, array, object | `gray-dark-bg border-radius-10 p-3` | outer wrapper: background, radius, padding |
| `contentClass` | string, array, object | `b-small-font muted-text-color d-flex align-items-start gap-2 flex-nowrap` | the icon + text row: font, colour, gap |
| `iconClass` | string, array, object | `icon-sm muted-text-color d-inline-flex flex-shrink-0` | span around the icon |
| `iconWrapperClass` | string, array, object | `icon-sm` | goes to `<k-icon>` as `wrapperClass`: icon size and colour |

## Slots

| Slot | Scope | What it does |
|---|---|---|
| default | – | the message; HTML (`<b>`, `<a>`, lists) is fine |

## Example

Warning with a different icon and colour:

```vue
<KInfoBox icon-name="time" icon-wrapper-class="icon-sm red-icon" content-class="b-small-font normal-text-color d-flex align-items-start gap-2">
    The submission deadline has passed.
</KInfoBox>
```

## Notes

- The `*Class` props replace the defaults, they do not extend them. Repeat the classes you want to keep (`border-radius-10 p-3`).
- A plain `class` on the component lands on the outer wrapper and is merged with `boxClass`. Use it for margins.
- Display only: no state, no events. Wrap it in `v-if` when it needs a close button.
- An unknown `iconName` renders an empty spot, no error.
- The colour classes follow `data-theme`.
