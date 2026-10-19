# KIcon

Inline SVG from `src/icons`, picked by file name.

```vue
<KIcon name="calendar" wrapperClass="icon-md" />
<KIcon name="circle-icons/pdf" :wrapperClass="['icon-lg', 'red-icon']" />
```

In Blade: `<k-icon name="close" wrapper-class="icon-sm"></k-icon>`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `name` | string | required | path inside `src/icons` without `.svg`: `close`, `icons-3d/benefits` |
| `wrapperClass` | string, array, object | `''` | classes on the wrapping `<span>`: size, colour, `clickable-icon` |

`@click` and other attributes fall through to the span.

## Notes

- Icons load lazily. Only the ones a page renders end up in the bundle, and the span is empty until the file arrives.
- An unknown `name` renders nothing and logs nothing.
- `id`s inside the SVG are prefixed per instance, so icons with gradients or masks can repeat on one page.
- The span is `aria-hidden`. Put the accessible label on the button or link around it.

Sizes, colours and the folder layout are in the [README](../../../README.md#icons).
