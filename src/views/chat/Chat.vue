<template>
  <div
    v-loading="messagesLoading"
    class="flex flex-col justify-items-center items-center pt-2 pb-2 md:pb-5 overflow-hidden h-full"
  >
    <div
      ref="messagesList"
      class="overflow-y-auto no-scrollbar flex-1 w-full px-5 md:px-20 pb-5 flex flex-col gap-6"
    >
      <div v-loading="messagesBatchLoading" />

      <Message
        v-for="message in messages"
        :key="message.id" :message="message"
        :currentUserMessage="currentUser?.id === message.users.id"
        :last="message.id === messages[messages.length-1].id"
        :lastRead="message.id === lastReadMessage?.id"
        @onMessageRead="markAsRead"
      />
      <NoMessage v-if="!messages.length && !messagesLoading" class="self-center my-auto" />
    </div>

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
import NoMessage from './components/NoMessages.vue'

const route = useRoute()

const authStore = useAuthStore()
const chatStore = useChatStore()

const messagesLoading = ref(false)
const messagesBatchLoading = ref(false)

const { currentUser } = storeToRefs(authStore)
const { messages, lastReadMessage, chats, currentChat, chatsLoading } = storeToRefs(chatStore)

const { loadMessageBatch, getChats } = chatStore

const router = useRouter()

const messagesList = ref<HTMLDivElement | null>(null)

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

watch(currentUser, async () => {
  loadChatsAndRedirectToLastActive()
}, { immediate: true })

function markAsRead (message: IDatabase['public']['Tables']['messages']['Row']) {
  const chatIndex = chats.value.findIndex(chat => chat.chat_id === message.chat_id)

  if (chatIndex !== -1) {
    const copy = { ...chats.value[chatIndex] }
    copy.unread_messages_count = copy.unread_messages_count ? copy.unread_messages_count - 1 : 0

    chats.value = [...chats.value.slice(0, chatIndex), copy, ...chats.value.slice(chatIndex + 1)]
  }
}

function addMessage (newMessage: IMessage, chatId: string) {
  if (chatId === newMessage.chat_id) {
    messages.value = [...messages.value, { ...newMessage, read: false }]
  }

  const chatIndex = chats.value.findIndex((ch) => ch.chat_id === newMessage.chat_id)

  if (chatIndex !== -1) {
    const ch = { ...chats.value[chatIndex] }
    ch.message = newMessage.message
    ch.message_created_at = newMessage.created_at
    ch.message_id = newMessage.id

    if (currentUser.value?.id !== newMessage.users.id) {
      ch.unread_messages_count = ch.unread_messages_count
        ? ch.unread_messages_count + 1
        : 1
    }

    const copy = [...chats.value]

    copy.splice(chatIndex, 1)
    chats.value = [ch, ...copy]
  }
}

function clearConversation (chat: any) {
  if (currentChat.value?.chat_id === chat.id) {
    messages.value = []
    currentChat.value = null

    router.replace({ name: routeNames.chat })
  }

  chats.value = chats.value.filter((ch) => ch.chat_id !== chat.id)
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
  let newChat: IDatabase['public']['Tables']['chats']['Row'] | null = null

  await chatService.onNewChat(async (chat) => {
    newChat = chat

    console.log('chat event')
  })

  chatService.onNewMessage(async (newMessage) => {
    console.log('message event')
    console.log(newChat)

    if (newChat) {
      const fetchedChats = await chatService.getChatsViews(currentUser.value?.id, newChat.id)

      if (fetchedChats.length) {
        chats.value = [{
          ...fetchedChats[0],
          unread_messages_count: 0
        }, ...chats.value]
      }

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

watch(route, async (route) => {
  const chatId = route.params.id as string

  messages.value = []

  if (chatId) {
    initialLoadMessages(chatId)
  }

  subscribeToChatMessagesEvents(chatId)
}, { immediate: true })
</script>
