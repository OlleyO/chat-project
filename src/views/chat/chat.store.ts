import { chatService } from './chat.service'

export const useChatStore = defineStore('chatStore', () => {
  const authStore = useAuthStore()
  const { currentUser } = storeToRefs(authStore)

  const maxMessagesPerRequest = 20

  const chats = ref<TChatData>([])
  const messages = ref<IMessage[]>([])
  const currentChat = ref<TCurrentChat>()

  const chatsLoading = ref(false)

  const lastReadMessage = computed(() => {
    const lastReadIndex = messages.value.findIndex(
      (message, index) => messages.value[index - 1]?.read && !message.read) - 1

    return messages.value[lastReadIndex]
  })

  async function loadMessageBatch (chatId: string) {
    const messageBatch = await chatService.getMessages(messages.value.length,
      messages.value.length + maxMessagesPerRequest, chatId) as unknown as IMessage[]

    messages.value = [...messageBatch.reverse(), ...messages.value]
  }

  async function getChats () {
    if (currentUser.value) {
      const fetchedChats = await chatService.getChatsViews(currentUser.value.id)

      chats.value = [...fetchedChats]

      return fetchedChats
    }
  }

  async function findChat (searchQuery: string) {
    if (!currentUser.value) {
      throw new Error('Error finding chats')
    }

    return await chatService.findChats(searchQuery, currentUser.value.id) as TChatData
  }

  async function deleteChat () {
    if (!currentChat.value) {
      throw new Error('Select chat to delete')
    }

    await chatService.deleteChat(currentChat.value.chat_id)
  }

  return {
    chats,
    messages,
    currentChat,
    chatsLoading,
    lastReadMessage,
    loadMessageBatch,
    getChats,
    findChat,
    deleteChat
  }
})
