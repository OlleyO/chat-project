<template>
  <aside
    class="transition-all shadow-2xl fixed left-0 w-full md:w-[240px] flex flex-col
       lg:w-[320px] z-[999] py-12 md:py-3 top-0 bottom-0 border-r
       border-border-primary bg-block-primary"
    :class="open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <el-button class="md:hidden absolute top-2 right-2" text circle @click="emit('onClose')">
      <el-icon class="text-xl leading-none">
        <CloseCross />
      </el-icon>
    </el-button>

    <el-input
      v-model="userInput"
      class="search-input w-full h-8 text-sm mb-3 px-6"
      placeholder="Search"
      :prefix-icon="MagnifyingGlass"
    />

    <div v-loading="chatsLoading" class="overflow-y-auto flex-1 pb-2 md:pb-6 no-scrollbar">
      <ContactItem
        v-for="chat in chatsToShow"
        :key="chat.chat_id!"
        :open="chat.chat_id === $route.params.id"
        :chat="chat"
        :online="!!onlineUsers[chat.user_id]"
        @click="onContactItemClicked(chat?.chat_id)"
      />

      <NoContent
        v-if="showNoChats"
        class="text-center mt-5" message="No Chats Found"
      />
    </div>

    <el-button
      class="mx-5"
      @click="$emit('openCreateReportForm')"
    >
      Send Report
    </el-button>
  </aside>
</template>

<script lang="ts" setup>
import MagnifyingGlass from '@/components/icons/MagnifyingGlass.vue'

defineProps<{
  open?: boolean
  onlineUsers: IOnlineUsers
}>()

const emit = defineEmits(['onClose', 'openCreateReportForm'])

const chatStore = useChatStore()
const { chats, currentChat, chatsLoading } = storeToRefs(chatStore)
const { findChat } = chatStore

const userInput = ref('')
const filteredChats = ref<TChatsTransformed>({})

const chatsToShow = computed(() => {
  const _chats = userInput.value.trim() ? filteredChats.value : chats.value
  const chatsArray = Object.keys(_chats).map(key => _chats[key])
  chatsArray.sort((ch1, ch2) => new Date(ch2.updated_at).getTime() - new Date(ch1.updated_at).getTime())

  return chatsArray
})

const showNoChats = computed(() => !chatsToShow.value.length)

function onContactItemClicked (chatId: string) {
  currentChat.value = chatsToShow.value.find(ch => ch?.chat_id === chatId)
  userInput.value = ''
  emit('onClose')
}

const debouncedFindChat = useDebounceFn(async () => {
  try {
    chatsLoading.value = true
    const fetchedChats = await findChat(userInput.value.trim()) ?? []

    filteredChats.value = chatService.chatsArrayToObject(fetchedChats)
  } catch (err) {
    notificationHandler(err as TAppError)
  } finally {
    chatsLoading.value = false
  }
}, 300)

watch(userInput, async (input) => {
  if (input.trim()) {
    debouncedFindChat()
  } else {
    filteredChats.value = {}
  }
})
</script>

<style lang="scss">
.search-input {
  .el-input__prefix {
    @apply text-xl leading-none;
  }
}
</style>
