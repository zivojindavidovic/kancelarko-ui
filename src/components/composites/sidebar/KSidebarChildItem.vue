<template>
  <div class="nav-child-item" :class="[{ active: isActive }, `nav-child-level-${level}`]">
    <div class="nav-child-link" @click="toggle">
      <a :href="url" :class="{ active: isActive }" :target="target">{{ label }}</a>

      <div v-if="hasChildren" class="nav-toggle-children">
        <k-icon name="expand" :wrapperClass="['icon-sm animation', { expanded: isExpanded }]"/>
      </div>
    </div>

    <div
      v-if="hasChildren"
      :id="collapseId"
      class="sidebar-nav-children collapse"
      :class="{ show: shouldShowChildren }"
    >
      <KSidebarChildItem
        v-for="child in children"
        :key="child.id || child.label"
        :item="child"
        :label="child.label"
        :target="child.target"
        :url="child.url"
        :active-urls="child.activeUrls || []"
        :children="child.children || []"
        :current-path="currentPath"
        :level="level + 1"
        @click="(payload) => emit('click', payload)"
      />
    </div>
  </div>
</template>

<script setup>
import { Collapse } from 'bootstrap'
import { computed, onMounted, ref } from 'vue'

defineOptions({
  name: 'KSidebarChildItem',
})

const props = defineProps({
  item: {
    type: Object,
    default: null
  },
  label: String,
  active: {
    type: Boolean,
    default: false
  },
  target: {
    type: String,
    default: '_self'
  },
  url: {
    type: String,
    default: 'javascript:void(0)'
  },
  children: {
    type: Array,
    default: () => []
  },
  /** dodatne putanje na kojima je stavka aktivna */
  activeUrls: {
    type: Array,
    default: () => []
  },
  level: {
    type: Number,
    default: 1
  },
  currentPath: {
    type: String,
    default: null
  },
})

const emit = defineEmits(['click'])

const currentPath = computed(() => props.currentPath || (typeof window !== 'undefined' ? window.location.pathname : ''))
const hasChildren = computed(() => props.children.length > 0)
const isExpanded = ref(false)

const isCurrentUrlActive = (url) => {
  if (!url || url === 'javascript:void(0)') {
    return false
  }

  const current = currentPath.value.replace(/\/$/, '')
  const target = url.replace(/\/$/, '')

  return current === target || current.startsWith(target + '/')
}

const hasActiveChild = (children) => {
  return children.some((child) => {
    return isCurrentUrlActive(child.url)
      || (child.activeUrls || []).some(isCurrentUrlActive)
      || hasActiveChild(child.children || [])
  })
}

const isActive = computed(() => {
  return props.active || isCurrentUrlActive(props.url) || props.activeUrls.some(isCurrentUrlActive)
})

const shouldShowChildren = computed(() => {
  return hasActiveChild(props.children)
})

const collapseId = `collapse-child-${Math.random().toString(36).slice(2)}`
let collapseInstance = null

onMounted(() => {
  if (!hasChildren.value) return

  const el = document.getElementById(collapseId)
  collapseInstance = new Collapse(el, {
    toggle: false
  })

  el.addEventListener('show.bs.collapse', (event) => {
    if (event.target !== el) return
    isExpanded.value = true
  })

  el.addEventListener('hide.bs.collapse', (event) => {
    if (event.target !== el) return
    isExpanded.value = false
  })

  if (shouldShowChildren.value) {
    collapseInstance.show()
    isExpanded.value = true
  }
})

function toggle(event) {
  emit('click', { item: props.item, event })

  if (!hasChildren.value || !collapseInstance) return
  collapseInstance.toggle()
}
</script>
