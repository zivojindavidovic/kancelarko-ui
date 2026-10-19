<template>
    <div class="d-flex flex-column user-select-none gap-2 tree-node">
        <div
            class="d-flex align-items-center node-row"
            :class="{
                'opacity-50': effectiveDisabled,
                'highlighted': isHighlighted
            }"
            @dblclick.stop="handleDoubleClick"
        >
            <!-- Expand/Collapse Arrow -->
            <button
                v-if="hasChildren"
                type="button"
                @click.stop="toggleExpanded"
                @dblclick.stop
                :class="['d-flex align-items-center justify-content-center bg-transparent border-0 p-0 btn-expand', { checked: isSelected }]"
            >
                <k-icon name="chevron-right" :wrapperClass="['icon-sm', { 'rotate': isExpanded }]"/>
            </button>
            <div v-else class="node-placeholder"></div>

            <!-- Checkbox -->
            <k-checkbox
                v-if="options.showCheckbox"
                :id="`tree-checkbox-${node.id}`"
                :model-value="checkboxState === 'checked'"
                :value="node.id"
                :disabled="effectiveDisabled"
                @update:model-value="handleCheckboxChange"
                @dblclick.stop
            />

            <div class="d-flex align-items-center gap-2 node-content">
                <!-- Icon -->
                <k-icon 
                    v-if="icon" 
                    :name="icon" 
                    :wrapper-class="['d-flex align-items-center justify-content-center node-icon', { checked: isSelected }]"
                />
    
                <!-- Label -->
                <span :class="isSelected ? 'node-label checked' : 'node-label'">{{ label }}</span>
            </div>
        </div>

        <!-- Children -->
        <transition name="expand">
            <div v-if="isExpanded && hasChildren" class="d-flex flex-column gap-2 tree-children" :class="{ 'no-transition': bulkExpanding }">
                <k-tree-node
                    v-for="child in children"
                    ref="childNodes"
                    :key="child.id"
                    :node="child"
                    :selected="selectedIds"
                    :disabled="propagateDisabled ? (disabled || child.disabled) : child.disabled"
                    :propagate-disabled="propagateDisabled"
                    :search-query="searchQuery"
                    :options="options"
                    :expanded-map="expandedMap"
                    :bulk-expanding="bulkExpanding"
                    :disabled-ids="disabledIds"
                    @select="$emit('select', $event)"
                />
            </div>
        </transition>
    </div>
</template>

<script>
import KCheckbox from '../../atoms/checkbox/KCheckbox.vue';

export default {
    name: 'KTreeNode',
    components: {
        KCheckbox,
    },
    props: {
        node: {
            type: Object,
            required: true,
            description: 'Tree node object with id, label, children, disabled, icon properties',
        },
        selected: {
            type: Array,
            default: () => [],
            description: 'Array of selected node IDs',
        },
        disabled: {
            type: Boolean,
            default: false,
            description: 'Whether the node is disabled',
        },
        propagateDisabled: {
            type: Boolean,
            default: true,
        },
        searchQuery: {
            type: String,
            default: '',
            description: 'Current search query for highlighting',
        },
        forceExpand: {
            type: Boolean,
            default: false,
            description: 'Force expand this node if search results are found in subtree',
        },
        expandedMap: {
            type: Object,
            default: () => ({}),
            description: 'Shared map of expanded node ids for bulk operations',
        },
        bulkExpanding: {
            type: Boolean,
            default: false,
            description: 'When true, disable transitions for faster bulk expand',
        },
        options: {
            type: Object,
            default: () => ({
                showCheckbox: true,
            }),
            description: 'Options to control component features',
        },
        disabledIds: {
            type: Set,
            default: () => new Set(),
            description: 'Set of disabled node IDs in single mode',
        },
    },
    emits: ['select'],
    data() {
        return {}
    },
    mounted() {

    },
    watch: {
        checkboxState: {
            handler(newVal) {
                // KCheckbox ne podržava direktno indeterminate stanje i mora da se ručno postavimo na DOM elementu
                this.$nextTick(() => {
                    const checkboxInput = document.getElementById(`tree-checkbox-${this.node.id}`);
                    if (checkboxInput && this.$el.contains(checkboxInput)) {
                        checkboxInput.indeterminate = (newVal === 'indeterminate');
                    }
                });
            },
            immediate: true,
        },
    },
    computed: {
        hasChildren() {
            return this.node.children && this.node.children.length > 0
        },
        isExpanded() {
            // !! is used to convert undefined to false, so we can toggle properly
            return !!(this.expandedMap && this.expandedMap[this.node.id])
        },
        isSelected() {
            return this.selected.includes(this.node.id)
        },
        isHighlighted() {
            if (!this.searchQuery) return false
            return this.node.label.toLowerCase().includes(this.searchQuery.toLowerCase())
        },
        effectiveDisabled() {
            const mode = this.options?.checkboxMode || 'auto'
            const childrenIds = this.getNonDisabledChildrenIds(this.allChildren)
            const selectionDisabled = Boolean(this.node?.selectionDisabled)

            const noActiveChildren = this.hasChildren && childrenIds.length === 0
            let isDisabledNode = false
            if (noActiveChildren && mode == 'auto') {
                this.node.disabled = true
                isDisabledNode = true
            } else if (noActiveChildren && mode == 'single') {
                this.node.disabled = false
                isDisabledNode = false
            }

            // Node is disabled if it's explicitly disabled or if it's in the single mode disabled set 
            // or if it has children but all are disabled (no active children)
            return (
                this.disabled ||
                selectionDisabled ||
                (this.disabledIds && this.disabledIds.has(this.node.id)) ||
                isDisabledNode
            )
        },
        label() {
            return this.node.label
        },
        icon() {
            return this.node.icon
        },
        children() {
            return this.node.children || []
        },
        allChildren() {
            // Prefer the original unfiltered children when available (used for selection state)
            if (this.node && this.node._original && Array.isArray(this.node._original.children)) {
                return this.node._original.children
            }
            return this.node.children || []
        },
        selectedIds() {
            return this.selected
        },
        checkboxState() {
            // In non-cascading modes, never show indeterminate state.
            const mode = this.options?.checkboxMode || 'auto'

            if (mode === 'single' || mode === 'manual') {
                return this.isSelected ? 'checked' : 'unchecked'
            }

            // Auto mode: calculate based on ORIGINAL children
            if (!this.allChildren || this.allChildren.length === 0) {
                return this.isSelected ? 'checked' : 'unchecked'
            }

            const childrenIds = this.getNonDisabledChildrenIds(this.allChildren)
            if (childrenIds.length === 0) {
                return 'unchecked'
            }

            const selectedChildren = childrenIds.filter(id => this.selected.includes(id))

            if (selectedChildren.length === 0) {
                return 'unchecked'
            } else if (selectedChildren.length === childrenIds.length) {
                return 'checked'
            } else {
                return 'indeterminate'
            }
        }
    },
    methods: {
        getAllChildrenIds(nodes) {
            let ids = []
            if (!nodes || nodes.length === 0) return ids

            nodes.forEach(node => {
                ids.push(node.id)
                if (node.children && node.children.length > 0) {
                    ids = ids.concat(this.getAllChildrenIds(node.children))
                }
            })
            return ids
        },
        getNonDisabledChildrenIds(nodes) {
            let ids = []
            if (!nodes || nodes.length === 0) return ids

            nodes.forEach(node => {
                if (!node.disabled) {
                    ids.push(node.id)
                }
                if (node.children && node.children.length > 0) {
                    ids = ids.concat(this.getNonDisabledChildrenIds(node.children))
                }
            })
            return ids
        },
        toggleExpanded() {
            if (!this.expandedMap) return
            const current = !!this.expandedMap[this.node.id]
            if (current) delete this.expandedMap[this.node.id]
            else this.expandedMap[this.node.id] = true
        },
        handleDoubleClick() {
            if (this.disabled) return
            if (this.hasChildren) {
                this.toggleExpanded()
            }
        },
        handleCheckboxChange(isChecked) {
            // Ova metoda se poziva kada KCheckbox emituje update:model-value
            // Umesto direktnog event objekta, sada dobijamo boolean vrednost
            
            const mode = this.options?.checkboxMode || 'auto'

            let disabledChildren = null
            if (mode === 'single' && this.hasChildren) {
                disabledChildren = this.getAllDescendantIds(this.allChildren)
            }

            // AUTO mode: pošalji jedan bulk event za roditelja + sve potomke
            if (mode === 'auto' && this.hasChildren) {
                const descendantIds = this.getNonDisabledChildrenIds(this.allChildren)

                this.$emit('select', {
                    ids: [this.node.id, ...descendantIds],
                    selected: isChecked,
                    bulk: true,
                })

                if (isChecked) {
                    if (this.expandedMap) this.expandedMap[this.node.id] = true
                    this.expandAllDescendants(this.allChildren)
                }

                return
            }

            // SINGLE mode ili leaf node: ostavi postojeće ponašanje
            this.$emit('select', {
                id: this.node.id,
                selected: isChecked,
                disabledChildren: mode === 'single' ? disabledChildren : null,
            })
        },
        expandAllDescendants(nodes) {
            if (!nodes || nodes.length === 0) return

            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    // expand this node
                    this.expandedMap[node.id] = true
                    // recurse
                    this.expandAllDescendants(node.children)
                }
            })
        },
        getAllDescendantIds(nodes) {
            let ids = []
            if (!nodes || nodes.length === 0) return ids

            nodes.forEach(node => {
                ids.push(node.id)
                if (node.children && node.children.length > 0) {
                    ids = ids.concat(this.getAllDescendantIds(node.children))
                }
            })
            return ids
        },
        // TREBA OBRISATI KASNIJE
        selectAllChildren(children, isSelected) {
            if (!children || children.length === 0) return

            children.forEach((child) => {
                // Only select if not disabled
                if (!child.disabled) {
                    // Emit select event for each child
                    this.$emit('select', {
                        id: child.id,
                        selected: isSelected,
                    })
                }

                // Recursively select all descendants
                if (child.children && child.children.length > 0) {
                    this.selectAllChildren(child.children, isSelected)
                }
            })
        },
        expandAllNested() {
            if (!this.hasChildren) return
            const mark = (node) => {
                if (!node || !node.id) return
                this.expandedMap[node.id] = true
                if (node.children && node.children.length) node.children.forEach(mark)
            }
            mark(this.node)
        },
        collapseAllNested() {
            const remove = (node) => {
                if (!node || !node.id) return
                delete this.expandedMap[node.id]
                if (node.children && node.children.length) node.children.forEach(remove)
            }
            remove(this.node)
        },
    },
}
</script>

<style scoped>

</style>
