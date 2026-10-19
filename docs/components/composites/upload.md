# Upload

Three pickers, none of them uploads. Each hands you `File` objects; you POST them to your endpoint.
`KFileUpload` is a drag-and-drop zone for one file with extension and size validation. `KDocumentUpload` is a
card row (title, add button, file name) for one document. `KDocumentUploadMulti` is the same card with a list.

In Blade: `<k-file-upload v-model="contract"></k-file-upload>`.

## Sending the files

```vue
<KFileUpload v-model="contract" :accept="['pdf']" />
<KDocumentUploadMulti title="Attachments" :files="attachments" :pending-files="pending"
    @select="file => pending.push(file)"
    @remove-pending="({ index }) => pending.splice(index, 1)"
    @delete="({ file, index }) => { deletedIds.push(file.ID); attachments.splice(index, 1) }" />
<button class="btn btn-primary" :disabled="contract?.status !== 'success'" @click="save">Save</button>
```

```js
data() {
    return { contract: null, attachments: [], pending: [], deletedIds: [] }
},
methods: {
    async save() {
        const formData = new FormData()
        formData.append('contract', this.contract.file)            // KFileUpload: the v-model object's .file
        this.pending.forEach(f => formData.append('files[]', f))    // KDocumentUploadMulti: raw File objects
        this.deletedIds.forEach(id => formData.append('deleted[]', id))
        await axios.post('/api/contracts', formData)
        this.pending = []
        this.deletedIds = []
    },
},
```

`KDocumentUpload` gives you the `File` in its `select` event; append it the same way.

## KFileUpload

Drop zone or click for one file. Validates, shows empty / success / error, writes the result to `v-model`:
`null` until a pick, then `{ id, file, name, size, sizeLabel, type, extension, progress, status, error }`.
`file` is the `File` you upload, `status` is `success` or `error`, `error` holds the message, `progress` is always `100`.

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `modelValue` | object | `null` | `v-model`, shape above |
| `accept` | array | `['pdf', 'jpg', 'jpeg', 'png']` | allowed extensions, with or without the dot |
| `maxFileSize` | number | `20 * 1024 * 1024` | bytes |
| `title` | string | `Dodajte dokument` | text above the zone |
| `messages` | object | `{}` | overrides for the built-in texts, keys below |
| `disabled` | boolean | `false` | no click, no drop |
| `showReplace` | boolean | `false` | replace icon next to the file name |

`messages` keys and defaults: `dragFileHere` "Prevucite fajl ovde", `or` "ili", `clickHere` "Kliknite ovde",
`toAdd` "kako biste dodali", `maxFileSize` "dokument maksimalne veličine", `fileAdded` "Dokument je uspešno dodat!",
`replaceFile` "Zamenite fajl", `invalidFileType` "Tip fajla nije dozvoljen.", `fileTooLarge` "Veličina fajla je veća od dozvoljene.".

### Events

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | object or `null` | picked, replaced, removed, or failed validation |
| `selected` | object | the file passed validation |
| `removed` | object | the delete icon was clicked; payload is the removed item |
| `validation-error` | `{ file, error }` | wrong extension or too large; `file` is the raw `File` |

Slots: `empty` (`{ isDragging, openFileDialog }`) replaces the zone while there is no file; `file` (`{ item, removeFile, openFileDialog }`) replaces it after a pick.

### Notes

- One file; a new pick replaces the old one. A rejected file still lands in `v-model` with `status: 'error'`, so check `status === 'success'` before sending.
- Outside changes to `v-model` are not picked up. To reset after saving, change the component's `:key`.

## KDocumentUpload

Card with a title, an add button and one file name. Stateless: you pass the file to show and update it on `select` / `remove`.

```vue
<KDocumentUpload title="Annex" :file="annex" :existing-file-name="employee.annexName" hide-add-when-has-file
    @select="file => annex = file" @remove="removeAnnex" />
```

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | string | required | |
| `file` | File, object | `null` | the picked file; its `name` is shown and wins over `existingFileName` |
| `existingFileName` | string | `''` | name of a file already on the server |
| `existingFileUrl` | string | `''` | URL of that file, used only for the image preview |
| `emptyText` | string | `''` | shown when empty and `showEmptyState` is on |
| `showEmptyState` | boolean | `false` | render the body with `emptyText` when empty |
| `hideAddWhenHasFile` | boolean | `false` | hide the add button once a file is shown |
| `addButtonLabel` | string | `Dodajte` | |
| `accept` | string | `.pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.csv` | HTML `accept` string |
| `boxClass` | string | `''` | extra classes on `.app-card-box` |
| `hideBorder` | boolean | `false` | no header divider while empty |
| `showImage` | boolean | `false` | thumbnail when the name ends in jpg, jpeg, png, webp or gif |

Events: `select` with the `File`; `remove` with nothing, clear `file` and `existingFileName` yourself.
No size check; look at `file.size` in `select` if you need one. The thumbnail of a new file is an object
URL the component creates and revokes; an existing file needs `existingFileUrl`.

## KDocumentUploadMulti

Card with a list: `files` (on the server, at least `{ ID, fileName }`) followed by `pendingFiles` (`File` objects
picked, not sent), with download, preview and delete per row. You change the arrays in the handlers, as at the top.

### Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | string | required | |
| `files` | array | `[]` | server files; `ID` is the row key, `fileName` the text |
| `pendingFiles` | array | `[]` | `File` objects picked but not sent; rows show `File.name` |
| `isReadonly` | boolean | `false` | hides the add button |
| `canDeleteFile` | function | `null` | declared, never called |
| `hideAddButton`, `hideAddWhenHasFile` | boolean | `false` | hide the add button always / once the list is non-empty |
| `addButtonLabel`, `downloadLabel`, `previewLabel`, `deleteLabel` | string | `Dodajte`, `Preuzmi`, `Pregled`, `Obriši` | button text and tooltips; `deleteLabel` is the button text with `deleteAsButton` |
| `emptyText` | string | `Nema dokumenata.` | |
| `showEmptyState` | boolean | `false` | show `emptyText` when the list is empty |
| `accept` | string | same as `KDocumentUpload` | HTML `accept` string |
| `multiple` | boolean | `true` | several files per dialog |
| `boxClass` | string | `app-card-box-padding-16` | |
| `canDownload`, `canPreview` | boolean | `false` | download / preview icon |
| `canDelete` | boolean | `true` | delete icon or button |
| `deleteAsButton` | boolean | `false` | outline button instead of the icon |
| `deleteIconName` | string | `delete` | `<k-icon>` name |

### Events

| Event | Payload | When |
|---|---|---|
| `select` | File | one event per picked file |
| `remove-pending` | `{ file, index }` | delete on a pending row; `index` is the position in `pendingFiles` |
| `delete` | `{ file, index }` | delete on a server row; `index` is the position in `files` |
| `download` | `{ file, index }` | download icon |
| `preview` | `{ file, index }` | preview icon |

### Notes

- `isReadonly` hides only the add button; `:can-delete="false"` hides delete.
- `download` and `preview` fire on pending rows too. There `file` is `{ fileName, file, _isPending: true }` and `index` counts within the combined list; check `file.ID` to skip them. `remove-pending` carries the same wrapper; the raw `File` is `file.file`.
- The native input resets after every pick, so the same file can be chosen again. No size check.
