<template>
    <div v-if="employee" class="employee-info-card" :class="{'has-bottom-border': borderBottom}">
        
        <!-- LEFT -->
        <div class="employee-info-card-wrapper">

            <!-- Avatar -->
            <div class="employee-avatar">
                <k-avatar
                    size="large"
                    :who="employee.fullName"
                    :src="employee.avatar"
                />
            </div>

            <!-- INFO -->
            <div class="employee-data-wrapper">

                <!-- NAME -->
                <div class="employee-name">
                    <slot name="name">
                        {{ employee.fullName }}
                    </slot>
                </div>

                <!-- HIERARCHY -->
                <div class="employee-data-list">
                    <slot name="hierarchy">
                        <div
                            v-for="(item, index) in computedHierarchy"
                            :key="index"
                            class="employee-data-item"
                        >
                            <k-icon :name="item.icon" wrapperClass="icon-sm gray-50-icon"/>
                            <div class="data-item-text">
                                {{ item.name }}
                            </div>
                        </div>
                    </slot>
                </div>

                <!-- WORK TIME (optional block) -->
                <div v-if="showWorkTime" class="d-inline-flex align-items-center gap-3">
                    <slot name="worktime">
                        <template v-if="workTimes?.length">
                            <div
                                v-for="(item, index) in workTimes"
                                :key="index"
                                :class="['d-flex gap-1']"
                            >
                                <KTooltip 
                                    v-if="item.is_unplanned && !onlyUnplannedPunches"
                                    placement="bottom"
                                    :popperClass="['align-text-center']"
                                    body="Neplanirano radno vreme"
                                    mode="hover"
                                >
                                    <k-icon name="time" wrapperClass="d-flex icon-sm red-icon"/>
                                </KTooltip>

                                <k-icon v-else name="time" wrapperClass="icon-sm gray-50-icon" />

                                <div v-if="!item.isDayOff" class="b-small-font muted-text-color">
                                    {{ formatTime(item.od) }} {{ item.od1 ? `(${formatTime(item.od1)})` : '' }}
                                    -
                                    {{ formatTime(item.do) }} {{ item.do1 ? `(${formatTime(item.do1)})` : '' }}
                                </div>

                                <div v-else class="b-small-font muted-text-color">
                                    Slobodan dan
                                </div>
                            </div>
                        </template>

                        <template v-else>
                            <div class="d-flex align-items-start gap-1">
                                <k-icon name="time" wrapperClass="icon-sm gray-50-icon" />
                                <div class="b-small-font muted-text-color">
                                    Nema organizaciju radnog vremena
                                </div>
                            </div>
                        </template>
                    </slot>
                </div>
            </div>
        </div>

        <!-- RIGHT (DATE, optional block) -->
        <div v-if="showDate" class="employee-info-card-date">
            <slot name="right">
                {{ dateLabel }}
            </slot>
        </div>

    </div>
</template>

<script>
import KAvatar from '../../atoms/avatar/KAvatar.vue';
import KTooltip from '../../atoms/tooltip/KTooltip.vue';

export default {
    name: 'KEmployeeCard',
    components: {
        KAvatar,
        KTooltip,
    },
    props: {
        employee: {
            type: Object,
            required: false,
        },
        workTimes: {
            type: Object,
            default: () => ({}),
        },
        showWorkTime: {
            type: Boolean,
            default: false,
        },
        showDate: {
            type: Boolean,
            default: true,
        },
        dateLabel: {
            type: String,
            default: null,
        },
        borderBottom: {
            type: Boolean,
            default: false
        },
        onlyUnplannedPunches: {
            type: Boolean,
            default: false
        },
    },
    computed: {
        computedHierarchy(){
            if(!this.employee?.wpPath) return []

            const parts = this.employee.wpPath
                .split(',')
                .map(i => i.trim())

            return parts.map((item, index) => {
                let icon = 'sector'

                if(index === 0) icon = 'company'
                else if(index === parts.length - 1) icon = 'profile-without-circle'

                return {
                    name: item,
                    icon
                }
            })
        }
    },
    methods: {
        formatTime(datetime){
            if(!datetime) return ''

            const date = new Date(datetime)

            const hours = String(date.getHours()).padStart(2,'0')
            const minutes = String(date.getMinutes()).padStart(2,'0')

            return `${hours}:${minutes}`
        }
    },
}
</script>