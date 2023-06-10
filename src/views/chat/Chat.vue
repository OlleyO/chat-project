<template>
  <div
    v-loading="messagesLoading"
    class="relative flex flex-col justify-items-center items-center
    pt-2 pb-2 md:pb-5 overflow-hidden h-full"
  >
    <div
      ref="messagesList"
      class="overflow-y-auto no-scrollbar flex-1 w-full px-5 md:px-20 pb-5 flex flex-col gap-6"
    >
      <div v-loading="messagesBatchLoading" />

      <Message
        v-for="message in messages"
        ref="messagesRef"
        :key="message.id"
        :message="message"
        :currentUserMessage="currentUser?.id === message.users.id"
        :last="message.id === messages[messages.length-1].id"
        :lastRead="message.id === lastReadMessage?.id"
      />
      <NoContent
        v-if="showNoMessages"
        class="self-center my-auto" message="Start Conversation"
      />
    </div>

    <el-button
      v-if="showScrollToLastReadButton"
      class="absolute bottom-40 right-5"
      @click="scrollToLastRead"
    >
      <span class="mr-2">Unread</span>

      <Badge :dot="showBadgeCountAsDot">
        {{ chats[$route.params.id as string].unread_messages_count }}
      </Badge>
    </el-button>

    <div class="md:min-w-[320px] w-full pt-2 px-5 flex-shrink-0 pb-5">
      <MessageForm
        :chatId="($route.params.id as string)"
        :senderId="(currentUser?.id as string)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { routeNames } from '@/router/route-names'

import Message from './components/Message.vue'
import MessageForm from './components/MessageForm.vue'

const route = useRoute()
const router = useRouter()

const messagesList = ref<HTMLDivElement | null>(null)
const messagesRef = ref<InstanceType<typeof Message>[]>([])

const authStore = useAuthStore()
const chatStore = useChatStore()

const { currentUser } = storeToRefs(authStore)
const { messages, lastReadMessage, chats, currentChat, chatsLoading } = storeToRefs(chatStore)
const { loadMessageBatch, getChats } = chatStore

const messagesLoading = ref(false)
const messagesBatchLoading = ref(false)

const showScrollToLastReadButton = computed(
  () => chats.value[route.params.id as string]?.unread_messages_count
)
const showBadgeCountAsDot = computed(() => chats.value[route.params.id as string].unread_messages_count === 1)

const showNoMessages = computed(() => !messages.value.length && !messagesLoading.value)

async function scrollToLastRead () {
  await nextTick()
  messagesRef.value.find(m => m.$props.message.id === lastReadMessage.value.id)?.$el.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
    inline: 'nearest'
  })
}

useInfiniteScroll(messagesList, async () => {
  const chatId = route.params.id as string
  if (chatId && !messagesLoading.value) {
    messagesBatchLoading.value = true
    await loadMessageBatch(chatId)
    messagesBatchLoading.value = false
  }
}, { distance: 10, direction: 'top', preserveScrollPosition: true })

async function loadChatsAndRedirectToLastActive () {
  try {
    chatsLoading.value = true
    const fetchedChats = await getChats()

    if (fetchedChats?.length) {
      currentChat.value = fetchedChats[0]

      router.replace({
        name: routeNames.chatRoom,
        params: {
          id: fetchedChats[0].chat_id
        }
      })
    }
  } catch (err) {
    notificationHandler(err as TAppError)
    router.replace({
      name: routeNames.chat
    })
  } finally {
    chatsLoading.value = false
  }
}

function markAsRead (message: IDatabase['public']['Tables']['messages']['Row']) {
  const chat = chats.value[message.chat_id]

  const msgIndex = messages.value.findIndex(msg => msg.id === message.id)

  if (msgIndex !== -1) {
    const msg = { ...messages.value[msgIndex] }

    const messagesCopy = [...messages.value]
    messagesCopy[msgIndex] = {
      ...msg,
      read: true
    }

    messages.value = messagesCopy
  }

  if (chat) {
    const ch = { ...chat }
    ch.unread_messages_count = ch.unread_messages_count ? ch.unread_messages_count - 1 : 0

    chats.value = {
      ...chats.value,
      [ch.chat_id]: ch
    }
  }
}

function addMessage (newMessage: IMessage, chatId: string) {
  if (chatId === newMessage.chat_id) {
    messages.value = [...messages.value, { ...newMessage, read: false }]
  }

  const chat = chats.value[newMessage.chat_id]

  if (chat) {
    const ch = { ...chat }
    ch.message = newMessage.message
    ch.message_created_at = newMessage.created_at
    ch.message_id = newMessage.id
    ch.updated_at = newMessage.created_at

    if (currentUser.value?.id !== newMessage.users.id) {
      ch.unread_messages_count = ch.unread_messages_count
        ? ch.unread_messages_count + 1
        : 1
    }

    chats.value = { ...chats.value, [ch.chat_id]: ch }
  }
}

async function addChat (chat: IDatabase['public']['Tables']['chats']['Row']) {
  if (currentUser.value) {
    const fetchedChats = await chatService.getChatsViews(currentUser.value?.id, chat.id)

    if (fetchedChats.length) {
      chats.value = {
        ...chats.value,
        [fetchedChats[0].chat_id]: {
          ...fetchedChats[0],
          unread_messages_count: 0

        }
      }
    }
  }
}

function clearConversation (chat: any) {
  if (currentChat.value?.chat_id === chat.id) {
    messages.value = []
    currentChat.value = null

    router.replace({ name: routeNames.chat })
  }

  const copy = { ...chats.value }
  delete copy[chat.id]
  chats.value = { ...copy }
}

async function initialLoadMessages (chatId: string) {
  messages.value = []

  try {
    messagesLoading.value = true
    await loadMessageBatch(chatId)
  } catch (err) {
    notificationHandler(err as TAppError)
  } finally {
    messagesLoading.value = false
  }
}

async function subscribeToChatMessagesEvents (chatId: string) {
  // to track what users chat shoud be added to
  let newChat: IDatabase['public']['Tables']['chats']['Row'] | null = null

  await chatService.onNewChat(async (chat) => {
    newChat = chat
  })

  chatService.onNewMessage(async (newMessage) => {
    if (newChat) {
      await addChat(newChat)
      newChat = null
    }

    addMessage(newMessage, chatId)
  })

  chatService.onUpdateMessage((updatedMessage) => {
    markAsRead(updatedMessage)
  })

  chatService.onDeleteChat((chat) => {
    clearConversation(chat)
  })
}

onMounted(async () => {
  loadChatsAndRedirectToLastActive()
})

watch(route, async (route) => {
  const chatId = route.params.id as string

  // reset messages on 'other chat' selected
  messages.value = []

  if (chatId) {
    initialLoadMessages(chatId)
  }

  subscribeToChatMessagesEvents(chatId)
}, { immediate: true })
</script>
