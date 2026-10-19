<template>
  <div class="sidebar-nav-row" :class="color">

    <!-- PARENT -->
    <div
      class="sidebar-nav-item"
      :class="{ active: isParentActive, 'has-active-child': shouldShowChildren }"
      @click="toggle"
    >
      <div class="nav-icon">
        <a :href="navigationUrl" :target="target">
          <k-icon :name="icon" :wrapperClass="['icon-md', color]"/>
        </a>
      </div>

      <div class="nav-link">
        <a :href="navigationUrl" :class="{ active: isParentActive }" :target="target">{{ label }}</a>
      </div>

      <!-- arrow -->
      <div v-if="hasChildren" class="nav-toggle-children">
        <k-icon name="expand" :wrapperClass="['icon-sm animation', { expanded: isExpanded }]"/>
      </div>
    </div>

    <!-- children -->
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
        :active="isChildActive(child)"
        :target="child.target"
        :url="child.url"
        :active-urls="child.activeUrls || []"
        :children="child.children || []"
        :current-path="currentPath"
        :level="1"
        @click="(payload) => emit('child-click', payload)"
      />
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Collapse } from 'bootstrap'
import KSidebarChildItem from './KSidebarChildItem.vue'
import { layoutStore } from '../page/layout-store'

defineOptions({
  name: 'KSidebarItem',
})

const props = defineProps({
  /** originalni objekat stavke - vraca se kroz click event */
  item: {
    type: Object,
    default: null
  },
  icon: String,
  /** npr. 'yellow-icon' - boja ikonice i aktivne stavke (components/_icons.scss) */
  color: String,
  label: String,
  active: Boolean,
  target: {
    type: String,
    default: '_self'
  },
  children: {
    type: Array,
    default: () => []
  },
  url: {
    type: String,
    default: 'javascript:void(0)'
  },
  /** dodatne putanje na kojima je stavka aktivna (npr. detalji zapisa sa drugim url-om) */
  activeUrls: {
    type: Array,
    default: () => []
  },
  /** putanja koja se poredi sa url-om; default je window.location.pathname */
  currentPath: {
    type: String,
    default: null
  },
})

const emit = defineEmits(['click', 'child-click'])

const currentPath = computed(() => props.currentPath || (typeof window !== 'undefined' ? window.location.pathname : ''))
const hasChildren = computed(() => props.children.length > 0)
const isExpanded = ref(false)

const findFirstNavigableChildUrl = (children) => {
  for (const child of children) {
    if (child.url && child.url !== 'javascript:void(0)') {
      return child.url
    }

    const nestedChildUrl = findFirstNavigableChildUrl(child.children || [])

    if (nestedChildUrl) {
      return nestedChildUrl
    }
  }

  return null
}

// kada je sidebar sklopljen, klik na ikonicu vodi na prvu podstranicu
const navigationUrl = computed(() => {
  if (!layoutStore.isSidebarMinimized || !hasChildren.value) {
    return props.url
  }

  return findFirstNavigableChildUrl(props.children) || props.url
})

const isUrlActive = (url) => {
  if (!url || url === 'javascript:void(0)') {
    return false
  }

  const current = currentPath.value.replace(/\/$/, '');
  const target = url.replace(/\/$/, '');

  return current === target || current.startsWith(target + '/');
}

// da li je parent aktivan (samo ako je njegova sopstvena ruta)
const isParentActive = computed(() => {
  if (props.active) return true
  if (hasChildren.value) return false

  return isUrlActive(props.url) || props.activeUrls.some(isUrlActive)
})

// child je aktivan ako je na svom url-u ili na nekom od dodatnih activeUrls
const isChildActive = (child) => {
  if (isUrlActive(child.url)) {
    return true
  }

  if (!child.activeUrls) {
    return false
  }

  return child.activeUrls.some(isUrlActive)
}

const isItemActive = (item) => {
  return isChildActive(item) || (item.children || []).some(child => isItemActive(child))
}

// da li treba prikazati children (ako je neki child aktivan)
const shouldShowChildren = computed(() => {
  return props.children.some(child => isItemActive(child));
})

// unique id for bootstrap collapse
const collapseId = `collapse-${Math.random().toString(36).slice(2)}`

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

  // ako treba da bude otvoren (neki child je aktivan), otvori ga
  if (shouldShowChildren.value) {
    collapseInstance.show()
    isExpanded.value = true
  }
})

function toggle(event) {
  emit('click', { item: props.item, event })

  if (layoutStore.isSidebarMinimized || !hasChildren.value || !collapseInstance) return
  collapseInstance.toggle()
}
</script>
