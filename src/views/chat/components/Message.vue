<template>
  <el-popover
    ref="popover"
    :visible="popoverOpen"
    trigger="contextmenu"
    placement="left"
    :auto-close="2000"
    :show-arrow="false"
    :width="50"
    :teleported="false"
  >
    <div class="flex flex-col">
      <el-button
        text
        :icon="Edit"
        @click="editMessage"
      />

      <el-button
        :type="$elComponentType.danger"
        :icon="Delete" text
        @click="deleteMessage"
      />
    </div>

    <template #reference>
      <div
        ref="messageRef"
        class="flex gap-1 relative"
        :class="{['self-end flex-row-reverse']: currentUserMessage}"
        @contextmenu.prevent="popoverOpen = currentUserMessage && !popoverOpen"
      >
        <AppAvatar
          class="self-end"
          :size="40"
          :src="message.users.avatar_url"
          :fullname="message.users.fullname"
          :online="false"
        />

        <div class="flex flex-col gap-1">
          <div
            class="text-sm font-semibold text-orange-500"
            :class="{['self-end']: currentUserMessage}"
          >
            {{ message.users.username }}
          </div>

          <div
            class="p-4 max-w-[320px] rounded-2xl text-primary break-words"
            :class="[currentUserMessage ? 'self-end bg-system-info-light rounded-br-none'
              : 'bg-block-tertiary rounded-bl-none']"
          >
            {{ message.message }}
          </div>

          <span
            class="text-xs text-secondary"
            :class="{['self-end']: currentUserMessage}"
          >{{ new Intl.DateTimeFormat("en-Us", {
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(message.created_at)) }}</span>
        </div>
      </div>
    </template>
  </el-popover>
</template>

<script lang="ts" setup>
import Delete from '@/components/icons/Delete.vue'
import Edit from '@/components/icons/Edit.vue'

const props = defineProps<{
  message: IMessage
  currentUserMessage: boolean
  last: boolean
  lastRead: boolean
}>()
const chatStore = useChatStore()
const { messageToEdit } = storeToRefs(chatStore)

const popover = ref(null)
const messageRef = ref<HTMLDivElement | null>(null)

const messageVisible = ref(false)
const popoverOpen = ref(false)

const read = toRef(() => props.message.read)
const last = toRef(() => props.last)

const { stop } = useIntersectionObserver(
  messageRef,
  ([{ isIntersecting }]) => {
    messageVisible.value = isIntersecting
  }
)

onClickOutside(popover, () => {
  popoverOpen.value = false
})

watch(messageVisible, async (visible) => {
  if (read.value) {
    stop()
  }

  if (visible && !read.value && !props.currentUserMessage) {
    await chatService.markMessageAsRead(props.message.id)
  }
})

function deleteMessage () {
  chatService.deleteMessage(props.message.id)
  popoverOpen.value = false
}

function editMessage () {
  messageToEdit.value = { ...props.message }
  popoverOpen.value = false
}

onMounted(() => {
  if (messageRef.value) {
    if (props.lastRead && !props.currentUserMessage) {
      messageRef.value.scrollIntoView({
        block: 'end',
        inline: 'nearest'
      })
      return
    }

    if (last.value && (props.currentUserMessage || props.message.read) && !props.lastRead) {
      messageRef.value.scrollIntoView()
    }
  }
})
</script>
