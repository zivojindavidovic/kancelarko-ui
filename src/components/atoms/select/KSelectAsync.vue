<template>
  <Multiselect
    v-model="innerValue"
    :options="internalOptions"
    :mode="mode"
    :searchable="searchable"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="isLoading"
    :label="label"
    :track-by="trackBy"
    :value-prop="valueProp"
    :object="object"
    :can-clear="canClear"
    :clear-on-search="clearOnSearch"
    :close-on-select="closeOnSelect"
    :limit="limit"
    :delay="-1"
    :no-options-text="noOptionsText"
    :no-results-text="noResultsText"
    :classes="classes"
    @open="onOpen"
    @close="$emit('close')"
    @clear="onClear"
    @select="(option, id) => $emit('select', { option, id })"
    @deselect="(option, id) => $emit('deselect', { option, id })"
    @search-change="onSearchChange"
  >
    <template #option="slotProps">
      <slot name="option" v-bind="slotProps">
        <div class="app-select__option">
          {{ slotProps.option?.[label] ?? slotProps.option }}
        </div>
      </slot>
    </template>

    <template #singlelabel="slotProps">
      <slot name="singlelabel" v-bind="slotProps">
        <div class="app-select__singlelabel">
          {{ slotProps.value?.[label] ?? slotProps.value }}
        </div>
      </slot>
    </template>

    <template #multiplelabel="slotProps">
      <slot name="multiplelabel" v-bind="slotProps">
        <div class="app-select__multiplelabel">
          {{ defaultMultipleLabel(slotProps.values) }}
        </div>
      </slot>
    </template>

    <template #tag="slotProps">
      <slot name="tag" v-bind="slotProps">
        <span class="app-select__tag">
          {{ slotProps.option?.[label] ?? slotProps.option }}
        </span>
      </slot>
    </template>

    <template #nooptions="slotProps">
      <slot name="nooptions" v-bind="slotProps">
        <div class="app-select__empty">{{ noOptionsText }}</div>
      </slot>
    </template>

    <template #noresults="slotProps">
      <slot name="noresults" v-bind="slotProps">
        <div class="app-select__empty">{{ noResultsText }}</div>
      </slot>
    </template>
  </Multiselect>
</template>

<script>
import Multiselect from '@vueform/multiselect'

export default {
  name: 'KSelectAsync',
  components: { Multiselect },

  props: {
    modelValue: { default: null },

    // OBAVEZNO u async komponenti
    resolveOptions: { type: Function, required: true },

    mode: { type: String, default: 'single' },

    label: { type: String, default: 'label' },
    trackBy: { type: String, default: 'value' },
    valueProp: { type: String, default: 'value' },
    object: { type: Boolean, default: true },

    searchable: { type: Boolean, default: true },
    placeholder: { type: String, default: 'Izaberi...' },
    disabled: { type: Boolean, default: false },
    canClear: { type: Boolean, default: true },
    clearOnSearch: { type: Boolean, default: false },
    closeOnSelect: { type: Boolean, default: true },
    limit: { type: Number, default: -1 },

    minChars: { type: Number, default: 0 },
    delay: { type: Number, default: 250 },

    noOptionsText: { type: String, default: 'Nema opcija.' },
    noResultsText: { type: String, default: 'Nema rezultata.' },

    classes: { type: Object, default: null },

    // da li da povuče inicijalno (query = '') kad se otvori / mountuje
    preload: { type: Boolean, default: true }
  },

  emits: [
    'update:modelValue',
    'change',
    'search-change',
    'open',
    'close',
    'clear',
    'select',
    'deselect',
    'options-loaded'
  ],

  data() {
    return {
      innerValue: this.modelValue,
      internalOptions: [],
      isLoading: false,
      _lastRequestId: 0
    }
  },

  watch: {
    modelValue(next) {
      this.innerValue = next
    },
    innerValue(next) {
      this.$emit('update:modelValue', next)
      this.$emit('change', next)
    }
  },

  mounted() {
    if (this.preload && this.minChars === 0) {
      this.fetchOptions('')
    }
  },

  beforeUnmount() {
    clearTimeout(this._searchTimer)
  },

  methods: {
    defaultMultipleLabel(values) {
      if (!Array.isArray(values) || values.length === 0) return ''
      if (values.length === 1) return values[0]?.[this.label] ?? values[0]
      return `${values.length} izabrano`
    },

    onOpen() {
      this.$emit('open')
      if (this.preload && this.internalOptions.length === 0 && this.minChars === 0) {
        this.fetchOptions('')
      }
    },

    onClear() {
      this.$emit('clear')
      // po želji: this.internalOptions = []
    },

    onSearchChange(query) {
      this.$emit('search-change', query)

      const q = (query ?? '').trim()
      if (q.length < this.minChars) return

      // debounce radimo ovde (Multiselect dobija delay=-1 jer su mu opcije niz, ne funkcija)
      clearTimeout(this._searchTimer)
      this._searchTimer = setTimeout(() => this.fetchOptions(q), Math.max(0, Number(this.delay) || 0))
    },

    async fetchOptions(query) {
      const requestId = ++this._lastRequestId
      this.isLoading = true

      try {
        const result = await this.resolveOptions(query)

        if (requestId !== this._lastRequestId) return

        this.internalOptions = Array.isArray(result) ? result : []
        this.$emit('options-loaded', this.internalOptions)
      } catch (e) {
        if (requestId !== this._lastRequestId) return
        this.internalOptions = []
      } finally {
        if (requestId === this._lastRequestId) {
          this.isLoading = false
        }
      }
    }
  }
}
</script>

<style src="@vueform/multiselect/themes/default.css"></style>

<style scoped>
/* prazno */
</style>
