<template>
  <div class="header-content-row cursor-pointer" @click="$emit('row-click')">

    <div class="header-content-icon">
      <span class="icon-lg">
        <k-icon :name="icon" />
      </span>
    </div>

    <div class="header-content-content">
      <div class="content-top">
        <div class="notification-title">{{ title }}</div>
        <div class="notification-time">
          {{ time }}
          <span v-if="unread" class="unread-notification"></span>
        </div>
      </div>

      <div class="content-bot">
        <div class="notification-text" v-html="textHtml" @click.stop="handleNotificationTextClick"></div>
        <button
          v-if="linkUrl"
          type="button"
          class="notification-icon-action bg-transparent border-0 p-0"
          @click.stop="$emit('open-link')"
        >
          <span class="icon-sm blue-icon">
            <k-icon name="link" />
          </span>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
    name: 'KNotificationRow',

    props: {
        icon: {
            type: String,
            default: 'notification-active',
        },
        title: {
            type: String,
            default: 'Notifikacija',
        },
        textHtml: {
            type: String,
            default: '',
        },
        time: {
            type: String,
            default: '',
        },
        unread: {
            type: Boolean,
            default: false,
        },
        linkUrl: {
            type: String,
            default: '',
        },
    },

    emits: ['open-link', 'row-click'],

    methods: {
        handleNotificationTextClick(event) {
            if (event?.target?.closest?.('a')) {
                event.preventDefault();
                this.$emit('open-link');
                return;
            }

            this.$emit('row-click');
        },
    },
};
</script>
