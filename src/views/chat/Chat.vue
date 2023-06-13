<template>
  <div
    v-loading="messagesLoading"
    class="relative flex flex-col justify-items-center items-center
    pt-2 pb-2 md:pb-0 overflow-hidden h-full
    xl:max-w-[calc(100%-280px)] mx-auto
    "
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
      :icon="BottomArrow"
      @click="scrollToLastRead"
    >
      <span class="mr-2">Unread</span>

      <Badge :dot="showBadgeCountAsDot">
        {{ chats[$route.params.id as string].unread_messages_count }}
      </Badge>
    </el-button>

    <div class="md:min-w-[320px] w-full pt-2 px-5 flex-shrink-0 pb-3">
      <MessageForm
        :chatId="($route.params.id as string)"
        :senderId="(currentUser?.id as string)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { routeNames } from '@/router/route-names'

import BottomArrow from '@/components/icons/BottomArrow.vue'

import Message from './components/Message.vue'
import MessageForm from './components/MessageForm.vue'

const route = useRoute()
const router = useRouter()

const messagesList = ref<HTMLDivElement | null>(null)
const messagesRef = ref<InstanceType<typeof Message>[]>([])

const authStore = useAuthStore()
const chatStore = useChatStore()

const { currentUser } = storeToRefs(authStore)
const { messages, cachedMessages, lastReadMessage, chats, currentChat, chatsLoading } = storeToRefs(chatStore)
const { loadMessageBatch, getChats } = chatStore

const messagesLoading = ref(false)
const messagesBatchLoading = ref(false)

const showScrollToLastReadButton = computed(
  () => chats.value[route.params.id as string]?.unread_messages_count
)
const showBadgeCountAsDot = computed(() => chats.value[route.params.id as string].unread_messages_count === 1)

const showNoMessages = computed(() => !messages.value.length && !messagesLoading.value)

async function scrollToLastRead () {
  messagesRef.value.find(m => m.$props.message.id === lastReadMessage.value.id)?.$el.nextElementSibling.scrollIntoView({
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
    cachedMessages.value[message.chat_id][msgIndex].read = true
  }

  if (chat) {
    const unreadMessagesCount = chat.unread_messages_count

    chats.value[chat.chat_id].unread_messages_count = unreadMessagesCount ? unreadMessagesCount - 1 : 0
  }
}

function addMessage (newMessage: TMessage) {
  const chat = chats.value[newMessage.chat_id]

  if (chat) {
    const chatId = chat.chat_id

    if (cachedMessages.value[chatId]) {
      cachedMessages.value[chatId]?.push({ ...newMessage, read: false })
    }

    chats.value[chatId].message = newMessage.message
    chats.value[chatId].message_created_at = newMessage.created_at
    chats.value[chatId].message_id = newMessage.id
    chats.value[chatId].updated_at = newMessage.created_at

    if (currentUser.value?.id !== newMessage.users?.id) {
      const unreadMessagesCount = chats.value[chatId].unread_messages_count
      chats.value[chatId].unread_messages_count = unreadMessagesCount + 1 || 1
    }
  }
}

function deleteMessage (message: TMessage) {
  if (cachedMessages.value[message.chat_id]) {
    cachedMessages.value[message.chat_id] = cachedMessages.value[message.chat_id].filter(msg => msg.id !== message.id)
  }

  if (chats.value[message.chat_id]) {
    const chatId = message.chat_id

    const lastMessage =
    cachedMessages.value[message.chat_id][cachedMessages.value[message.chat_id]?.length - 1 || 0] || message
    chats.value[chatId].message = lastMessage.message
    chats.value[chatId].message_created_at = lastMessage.created_at
    chats.value[chatId].message_id = lastMessage.id
    chats.value[chatId].updated_at = lastMessage.created_at
  }
}

function editMessage (message: TMessage) {
  const msgIndex = cachedMessages.value[message.chat_id]?.findIndex(msg => msg.id === message.id) || -1

  if (msgIndex !== -1) {
    cachedMessages.value[message.chat_id][msgIndex].message = message.message
  }

  if (chats.value[message.chat_id].message_id === message.id) {
    chats.value[message.chat_id].message = message.message
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
    cachedMessages.value[chat.id] = []
    currentChat.value = null

    router.replace({ name: routeNames.chat })
  }

  delete chats.value[chat.id]
}

async function initialLoadMessages (chatId: string) {
  try {
    if (!cachedMessages.value[chatId]) {
      messagesLoading.value = true
      cachedMessages.value[chatId] = []
      await loadMessageBatch(chatId)
    }
  } catch (err) {
    notificationHandler(err as TAppError)
  } finally {
    messagesLoading.value = false
  }
}

async function subscribeToChatMessagesEvents () {
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

    addMessage(newMessage)
  })

  chatService.onDeleteMessage((message) => {
    deleteMessage(message)
  })

  chatService.onUpdateMessage((payload) => {
    const updatedMessage = payload.new

    if (payload.old.read === updatedMessage.read) {
      editMessage(updatedMessage)
    } else {
      markAsRead(updatedMessage)
    }
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

  if (chatId) {
    initialLoadMessages(chatId)
  }

  subscribeToChatMessagesEvents()
}, { immediate: true })
</script>
