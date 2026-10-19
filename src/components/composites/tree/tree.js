export function buildTreeStructure(
    orgTreeData,
    treeEmpData = [],
    options = {
        includeEmployees: false,
        includeSupervisor: false,
        employeeUnderSupervision: [],
        includeArchived: false,
        hideExternal: false
    }
) {
    const { includeEmployees, includeSupervisor, employeeUnderSupervision, includeArchived, hideExternal } = options

    const iconMap = {
        extern_icon: 'company',
        company_icon: 'company',
        sector_icon: 'sector',
        workplace_icon: 'work-place',
    }

    const mapIcon = (item) => {
        const type = item?.li_attr?.typeIcon || item.icon || ''

        for (const key in iconMap) {
            if (type && type.indexOf(key) !== -1) {
                return iconMap[key]
            }
        }

        if (item?.icon) {
            return item.icon
        }

        return 'sector'
    }

    // format orgTreeData into hierarchical structure expected by KTree.vue
    const nodesById = {}
    orgTreeData.forEach((item) => {
        nodesById[item.id] = {
            id: String(item.id),
            label: item.text || item.label || String(item.id),
            icon: mapIcon(item),
            children: [],
            _object: item.object,
            orig_data: item.orig_data || item,
        }
    })

    // attach children
    const roots = []
    orgTreeData.forEach((item) => {
        const node = nodesById[item.id]
        if (!node) return

        if (!item.parent || item.parent === '#' || item.parent === null) {
            roots.push(node)
        } else {
            const parent = nodesById[item.parent]
            if (parent) {
                parent.children.push(node)
            }else{
                roots.push(node)
            }
        }
    })

    // optionally attach employees under their object node
    if (includeEmployees && Array.isArray(treeEmpData)) {
        treeEmpData.forEach((emp) => {
            if (!includeArchived && emp.archived && Number(emp.archived) !== 0) return

            const parentNode = Object.values(nodesById).find(
                (n) => Number(n._object) === Number(emp.objectID)
            )

            const empNode = {
                id: `emp_${emp.ID}_obj_${emp.objectID}`,
                label: `${emp.firstname || ''} ${emp.lastname || ''}`.trim(),
                icon: 'profile-without-circle',
                orig_data: emp,
            }

            if(includeSupervisor){
                empNode.disabled = !employeeUnderSupervision.includes(emp.ID)
            }

            if (parentNode) {
                parentNode.children.push(empNode)
            }else if (!hideExternal){
                roots.push(empNode)
            }
        })
    }

    return roots
}
