<template>
    <div class="d-flex flex-column gap-2 position-relative tree-container" :class="[wrapperClass, {'px-0 py-0': noPadding}]">
        <!-- loader spinner -->
        <div v-if="isLoading" class="d-flex align-items-center justify-content-center position-absolute top-0 start-0 w-100 h-100 rounded bg-dark bg-opacity-25 z-3">
            <div class="text-center normal-text-color">
                <div class="spinner-border spinner-border-lg mb-3" role="status">
                <span class="visually-hidden">{{ loadingLabel }}</span>
                </div>
                <p class="small">{{ loadingDataLabel }}</p>
            </div>
        </div>

        <!-- Search -->
        <div v-if="config.searchable" class="search-container">
            <div class="input-group input-group-icon-left">
                <span class="input-group-icon">
                    <k-icon name="search" wrapperClass="icon-sm"/>
                </span>
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    class="form-control" 
                    :placeholder="searchPlaceholder"
                >
            </div>
        </div>

        <!-- Tree Content -->
        <div class="d-flex flex-column  gap-3 align-self-stretch p-4 tree-content">
            <div class="overflow-y-auto">
                <tree-node
                    v-for="node in filteredData"
                    :ref="`treeNode_${node.id}`"
                    :key="node.id"
                    :node="node"
                    :selected="selected"
                    :search-query="searchQuery"
                    :force-expand="shouldForceExpand(node)"
                    :options="config"
                    :expanded-map="expandedMap"
                    :bulk-expanding="bulkExpanding"
                    :disabled-ids="disabledIds"
                    :propagate-disabled="config.propagateDisabled !== false"
                    @select="handleSelect"
                />
                <div v-if="filteredData.length === 0 && searchQuery" class="text-secondary small py-4 text-center">
                    {{ noResultsLabel }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { toRaw } from 'vue';
import TreeNode from './KTreeNode.vue'

export default {
    name: 'KTree',
    components: {
        TreeNode,
    },
    props: {
        data: {
            type: Array,
            required: true,
            description: 'Array of tree nodes',
        },
        title: {
            type: String,
            default: 'Tree View',
            description: 'Header title of the tree',
        },
        showHeader: {
            type: Boolean,
            default: true,
            description: 'Show/hide the header section',
        },
        searchPlaceholder: {
            type: String,
            default: 'Pretraži...',
            description: 'Placeholder text for search input',
        },
        loadingLabel: {
            type: String,
            default: 'Učitavanje...',
        },
        loadingDataLabel: {
            type: String,
            default: 'Učitavanje podataka...',
        },
        noResultsLabel: {
            type: String,
            default: 'Nema rezultata',
        },
        config: {
            type: Object,
            default: () => ({
                showCheckbox: true,
                searchable: true,
                checkboxMode: 'single', // 'auto', 'single' or 'manual'
            }),
            description: 'Options to control component features',
        },
        isLoading: {
            type: Boolean,
            default: false,
            description: 'Show/hide the loader section',
        },
        noPadding: {
            type: Boolean,
            default: false,
            description: 'Remove padding - .tree-container',
        },
        wrapperClass: {
            type: String,
            default: '',
        },
    },
    emits: ['update:selected'],
    data() {
        return {
            searchQuery: '',
            selected: [],
            // map of expanded node ids for bulk operations
            expandedMap: {},
            // flag to indicate bulk expand/collapse to disable animations
            bulkExpanding: false,
            // Set of disabled node IDs in single mode
            disabledIds: new Set(),
            parentMap: new Map(),
        }
    },
    mounted() {

    },
    computed: {
        selectedCount() {
            return this.selected.length
        },
        selectedNodes() {
            return this.selected
        },
        filteredData() {
            if (!this.searchQuery) {
                return this.data
            }

            const query = this.searchQuery.toLowerCase()

            const filterNodes = (nodes) => {
                return nodes
                    .filter(
                        (node) =>
                            node.label.toLowerCase().includes(query) ||
                            (node.children && filterNodes(node.children).length > 0),
                    )
                    .map((node) => ({
                        ...node,
                        _original: node,
                        children: node.children ? filterNodes(node.children) : undefined,
                    }))
            }

            return filterNodes(this.data)
        },
    },
    watch: {
        searchQuery(newVal) {
            // clear expand state when search is cleared
            if (!newVal || !newVal.trim()) {
                this.expandedMap = {}
                return
            }

            const query = newVal.toLowerCase()

            // reset first
            this.expandedMap = {}

            // expand ALL parents of matched nodes
            this.expandParentsForSearch(this.data, query)
        },
        data: { 
            handler(newVal) {
                if (!newVal || !newVal.length) return

                // ako nije potrebno da se cuvaju id-evi roditelja koji su stiklirani od strane dece, dovoljno je da se ne pokrece buildParentMap iliti watcher
                this.buildParentMap()
            },
            immediate: true,
        },
    },
    methods: {
        shouldForceExpand(node) {
            if (!this.searchQuery) return false
            const query = this.searchQuery.toLowerCase()

            const hasMatchInSubtree = (n) => {
                if (n.label.toLowerCase().includes(query)) return true
                if (n.children && n.children.length > 0) {
                    return n.children.some(child => hasMatchInSubtree(child))
                }
                return false
            }

            return hasMatchInSubtree(node)
        },
        handleSelect(event) {
            if (!event) return

            // BULK select/deselect
            if (event.bulk && Array.isArray(event.ids)) {
                const ids = [...new Set(event.ids)]

                if (event.selected) {
                    ids.forEach(id => {
                        if (!this.selected.includes(id)) {
                            this.selected.push(id)
                        }
                    })

                    if (this.config.exclusiveHierarchySelection) {
                        this.removeSelectedAncestorsWithSelectedDescendants()
                    }
                } else {
                    this.selected = this.selected.filter(id => !ids.includes(id))
                }

                // parent update samo za prvi id (root kliknutog noda)
                this.$nextTick(() => {
                    this.updateParentSelectionFrom(ids[0])
                    if (event.emitUpdate !== false) {
                        this.$emit('update:selected', this.selected)
                    }
                })

                return
            }

            // SINGLE event ponašanje
            if (!event.id) return

            const { id, selected: isSelected, disabledChildren } = event

            if (this.config.singleSelect && isSelected) {
                this.selected = [id]
                this.disabledIds.clear()
            } else {
                if (isSelected) {
                    if (this.config.exclusiveHierarchySelection) {
                        this.removeSelectedAncestorsAndDescendants(id)
                    }

                    if (!this.selected.includes(id)) {
                        this.selected.push(id)
                    }
                } else {
                    this.selected = this.selected.filter((s) => s !== id)
                }
            }

            if (disabledChildren && Array.isArray(disabledChildren)) {
                if (isSelected) {
                    // deselect children
                    disabledChildren.forEach(childId => {
                        this.selected = this.selected.filter((s) => s !== childId)
                    })
                    // disable them
                    disabledChildren.forEach(childId => {
                        this.disabledIds.add(childId)
                    })
                } else {
                    // re-enable children on deselect (important!)
                    disabledChildren.forEach(childId => {
                        this.disabledIds.delete(childId)
                    })
                }
            }

            if (this.config.checkboxMode === 'auto') {
                this.selectAllDescendantsFromRoot(id, isSelected)
            } else if (this.config.checkboxMode === 'single') {
                this.disableAllDescendantsFromRoot(id, isSelected)
            }

            this.$nextTick(() => {
                this.updateParentSelectionFrom(id)
                this.$emit('update:selected', this.selected)
            })
        },
        expandAll() {
            // Bulk expand: populate expandedMap with all node ids in one pass
            this.bulkExpanding = true
            const allIds = this.getAllChildrenIds(this.data)
            // include root ids as well
            this.data.forEach(n => { if (n && n.id) allIds.push(n.id) })
            allIds.forEach(id => { this.expandedMap[id] = true })
            // allow one render pass then clear bulk flag
            this.$nextTick(() => {
                setTimeout(() => { this.bulkExpanding = false }, 50)
            })
        },
        collapseAll() {
            this.bulkExpanding = true
            // clear expandedMap
            Object.keys(this.expandedMap).forEach(k => { delete this.expandedMap[k] })
            this.$nextTick(() => {
                setTimeout(() => { this.bulkExpanding = false }, 50)
            })
        },
        updateParentSelectionFrom(id) {
            // Skip parent update if checkbox mode does not cascade.
            if (this.config && ['single', 'manual'].includes(this.config.checkboxMode)) {
                return
            }

            if (!this.data || this.data.length === 0) return
            
            let currentParent = this.parentMap.get(id)

            while (currentParent) {
                const parentNode = this.findNodeById(this.data, currentParent)

                if (!parentNode || !parentNode.children) break

                const enabledChildrenIds = this.getNonDisabledChildrenIds(parentNode.children)

                if (
                    enabledChildrenIds.length > 0 &&
                    enabledChildrenIds.every(childId => this.selected.includes(childId))
                ) {
                    if (!this.selected.includes(currentParent)) {
                        this.selected.push(currentParent)
                    }
                } else {
                    this.selected = this.selected.filter(selId => selId !== currentParent)
                }

                currentParent = this.parentMap.get(currentParent)
            }
        },
        buildParentMap() {
            const map = new Map()

            const traverse = (nodes, parentId = null) => {
                nodes.forEach(node => {
                    if (parentId) {
                        map.set(node.id, parentId)
                    }
                    if (node.children) {
                        traverse(node.children, node.id)
                    }
                })
            }

            traverse(this.data)
            this.parentMap = map
        },
        removeSelectedAncestorsAndDescendants(id) {
            const relatedIds = new Set()
            const node = this.findNodeById(this.data, id)

            if (node?.children?.length) {
                this.getAllChildrenIds(node.children).forEach(childId => {
                    relatedIds.add(childId)
                })
            }

            let parentId = this.parentMap.get(id)

            while (parentId) {
                relatedIds.add(parentId)
                parentId = this.parentMap.get(parentId)
            }

            this.selected = this.selected.filter(selectedId => !relatedIds.has(selectedId))
        },
        removeSelectedAncestorsWithSelectedDescendants() {
            const selectedIds = new Set(this.selected)
            const ancestorIds = new Set()

            this.selected.forEach(id => {
                let parentId = this.parentMap.get(id)

                while (parentId) {
                    if (selectedIds.has(parentId)) {
                        ancestorIds.add(parentId)
                    }

                    parentId = this.parentMap.get(parentId)
                }
            })

            this.selected = this.selected.filter(id => !ancestorIds.has(id))
        },
        findNodeById(nodes, id) {
            if (!nodes || !Array.isArray(nodes)) return null
            for (const node of nodes) {
                if (node && node.id === id) return node
                if (node && node.children) {
                    const found = this.findNodeById(node.children, id)
                    if (found) return found
                }
            }
            return null
        },
        getAllChildrenIds(nodes) {
            let ids = []
            if (!nodes || !Array.isArray(nodes)) return ids

            nodes.forEach(node => {
                if (node && node.id) {
                    ids.push(node.id)
                    if (node.children && Array.isArray(node.children)) {
                        ids = ids.concat(this.getAllChildrenIds(node.children))
                    }
                }
            })
            return ids
        },
        getNonDisabledChildrenIds(nodes) {
            let ids = []
            if (!nodes || !Array.isArray(nodes)) return ids

            nodes.forEach(node => {
                if (node && node.id && !node.disabled) {
                    ids.push(node.id)
                    if (node.children && Array.isArray(node.children)) {
                        ids = ids.concat(this.getNonDisabledChildrenIds(node.children))
                    }
                }
            })
            return ids
        },
        getSelectedNodes() {
            return this.selected
        },
        clearSelection() {
            this.selected = []
            this.collapseAll();
            this.$emit('update:selected', this.selected)
        },
        selectAll() {
            this.selectAllNodes(this.data)
            this.expandAll();
            this.$emit('update:selected', this.selected)
        },
        selectAllNodes(nodes) {
            if (!nodes || nodes.length === 0) return

            nodes.forEach((node) => {
                // Skip disabled nodes and nodes that are disabled due to single mode
                if (!this.selected.includes(node.id) && !node.disabled && !this.disabledIds.has(node.id)) {
                    this.selected.push(node.id)
                }
                if (node.children) {
                    this.selectAllNodes(node.children)
                }
            })
        },
        deselectAll() {
            this.selected = []
            this.$emit('update:selected', this.selected)
        },
        expandPathToNode(id) {
            let current = this.parentMap.get(id)

            while (current) {
                this.expandedMap[current] = true
                current = this.parentMap.get(current)
            }
        },
        expandParentsForSearch(nodes, query) {
            let shouldExpandAny = false

            nodes.forEach(node => {
                let matchInChildren = false

                if (node.children && node.children.length > 0) {
                    matchInChildren = this.expandParentsForSearch(node.children, query)
                }

                const selfMatch = node.label.toLowerCase().includes(query)

                if (selfMatch || matchInChildren) {
                    this.expandedMap[node.id] = true
                    shouldExpandAny = true
                }
            })

            return shouldExpandAny
        },
        selectAllDescendantsFromRoot(id, isSelected) {
            const node = this.findNodeById(this.data, id)
            if (!node || !node.children) return

            const traverse = (nodes) => {
                nodes.forEach(child => {
                    const isDisabled =
                        child.disabled ||
                        (this.disabledIds && this.disabledIds.has(child.id))

                    // preskače disabled nodove
                    if (!isDisabled) {
                        if (isSelected) {
                            if (!this.selected.includes(child.id)) {
                                this.selected.push(child.id)
                            }
                        } else {
                            this.selected = this.selected.filter(
                                s => s !== child.id
                            )
                        }
                    }

                    // recurse
                    if (child.children && child.children.length > 0) {
                        traverse(child.children)
                    }
                })
            }

            traverse(node.children)
        },
        disableAllDescendantsFromRoot(id, shouldDisable) {
            const node = this.findNodeById(this.data, id)
            if (!node || !node.children) return

            const idsToRemove = new Set()

            const traverse = (nodes) => {
                nodes.forEach(child => {
                    idsToRemove.add(child.id)

                    // disable / enable
                    if (shouldDisable) {
                        this.disabledIds.add(child.id)
                    } else {
                        this.disabledIds.delete(child.id)
                    }

                    if (child.children && child.children.length > 0) {
                        traverse(child.children)
                    }
                })
            }

            traverse(node.children)

            this.selected = this.selected.filter(
                id => !idsToRemove.has(id)
            )
        },
        getSelectedEmployeesWithOriginalData() {
            const employees = []

            this.selected.forEach(id => {
                if (!id.toString().startsWith('emp_')) return

                const node = this.findNodeById(this.data, id)
                if (!node) return

                if (node.orig_data) {
                    employees.push(toRaw(node.orig_data))
                }
            })

            return employees
        },
        getSelectedNodesWithOriginalData() {
            const result = {
                nodes: [],
                employees: []
            }
            const addedIds = new Set()

            const addEmployee = (node) => {
                if (node.orig_data && !addedIds.has(node.id)) {
                    addedIds.add(node.id)
                    result.employees.push(toRaw(node.orig_data))
                }
            }

            const collectEmployeesFromNode = (node) => {
                if (node.id?.toString().startsWith('emp_')) {
                    addEmployee(node)
                }
                if (node.children?.length) {
                    node.children.forEach(child => collectEmployeesFromNode(child))
                }
            }

            this.selected.forEach(id => {
                const node = this.findNodeById(this.data, id)
                if (!node) return

                if (id.toString().startsWith('emp_')) {
                    addEmployee(node)
                } else {
                    // Add structure node data
                    if (!addedIds.has(id)) {
                        addedIds.add(id)
                        result.nodes.push(toRaw(node.orig_data ?? node))
                    }
                    // Also collect its employee descendants
                    collectEmployeesFromNode(node)
                }
            })

            return result
        },
        selectById(id) {
            if (!id) return

            this.expandPathToNode(id)

            this.handleSelect({
                id,
                selected: true
            })
        },
       selectByIds(ids = [], { expandSelected = false, emitUpdate = true } = {}) {
            if (!Array.isArray(ids)) return

            this.handleSelect({
               ids,
               selected: true,
               bulk: true,
               emitUpdate
           })

            ids.forEach(id => {
                if (!id) return

                this.expandPathToNode(id)
                if (expandSelected) this.expandedMap[id] = true
            })
        },
        deselectById(id) {
            if (!id) return

            this.selected = this.selected.filter(selectedId => selectedId !== id)

            // ažuriraj parent state (ako nije single mode)
            this.$nextTick(() => {
                this.updateParentSelectionFrom(id)
                this.$emit('update:selected', this.selected)
            })
        },
        disableAllNodes() {
            this.disabledIds = new Set(this.getAllChildrenIds(this.data))
        },
        enableAllNodes() {
            this.disabledIds = new Set()
        },
        disableNode(ids, cascade = true) {
            if (!ids) return

            // Pretvori u niz ako je prosleđen samo jedan id
            ids = Array.isArray(ids) ? ids : [ids]

            const disableRecursive = (n) => {
                this.disabledIds.add(n.id)

                if (cascade && n.children) {
                    n.children.forEach(child => {
                        disableRecursive(child)
                    })
                }
            }

            ids.forEach(id => {
                const node = this.findNodeById(this.data, id)

                if (node) {
                    disableRecursive(node)
                }
            })

            this.$emit('update:selected', this.selected)
        },
        enableNode(ids, cascade = true) {
            if (!ids) return

            // Pretvori u niz ako je prosleđen samo jedan id
            ids = Array.isArray(ids) ? ids : [ids]

            const enableRecursive = (n) => {
                this.disabledIds.delete(n.id)

                if (cascade && n.children) {
                    n.children.forEach(child => {
                        enableRecursive(child)
                    })
                }
            }

            ids.forEach(id => {
                const node = this.findNodeById(this.data, id)

                if (node) {
                    enableRecursive(node)
                }
            })
        },
    }
}
</script>

<style scoped>

</style>
