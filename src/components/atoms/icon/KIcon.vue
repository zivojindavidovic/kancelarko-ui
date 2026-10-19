<template>
	<span
		v-if="svgContent"
		class="inline-block"
		v-html="svg"
		:class="wrapperClass"
		aria-hidden="true"
	/>
</template>

<script>
const svgModules = import.meta.glob('../../../icons/**/*.svg', {
	query: '?raw',
	import: 'default',
})

const icons = {}

/* stari nazivi (icons_3d/benefits, kancelarko_logo_full, eArhiviranje) -> kebab-case fajlovi */
export function normalizeIconName(name) {
	return String(name ?? '')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/_/g, '-')
		.toLowerCase()
}

for (const path in svgModules) {
	const relativePath = path.split('/icons/')[1].replace('.svg', '')
	const iconName = relativePath.replace(/\\/g, '/')

	icons[iconName] = svgModules[path]
}

export default {
	name: 'KIcon',

	props: {
		name: {
			type: String,
			required: true,
		},
		wrapperClass: {
			type: [String, Array, Object],
			default: '',
		},
	},

	data() {
		return {
			uid: `icon-${Math.random().toString(36).slice(2, 9)}`,
			svgContent: null,
		}
	},

	computed: {
		svg() {
			const raw = this.svgContent

			if (!raw || typeof raw !== 'string') {
				return null
			}

			const prefix = `icon-${this.uid}-`

			let out = raw.replace(/\sid="([^"]+)"/g, (m, id) => ` id="${prefix}${id}"`)
			out = out.replace(/url\(#([^)]+)\)/g, (m, id) => `url(#${prefix}${id})`)
			out = out.replace(/\shref="#([^"]+)"/g, (m, id) => ` href="#${prefix}${id}"`)
			out = out.replace(/\sxlink:href="#([^"]+)"/g, (m, id) => ` xlink:href="#${prefix}${id}"`)

			return out
		},
	},

	watch: {
		name: {
			immediate: true,
			handler() {
				this.loadIcon()
			},
		},
	},

	methods: {
		async loadIcon() {
			this.svgContent = null

			const loader = icons[this.name] || icons[normalizeIconName(this.name)]

			if (!loader) {
				return
			}

			this.svgContent = await loader()
		},
	},
}
</script>