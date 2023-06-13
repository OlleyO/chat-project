import { chatService } from './chat.service'

export const useChatStore = defineStore('chatStore', () => {
  const authStore = useAuthStore()
  const { currentUser } = storeToRefs(authStore)

  const maxMessagesPerRequest = 20

  const chats = ref<TChatsTransformed>({})
  const foundChats = ref<TChatsTransformed | null>(null)
  const currentChat = ref<TCurrentChat>()
  const cachedMessages = ref<TCachedMessages>({})
  const messageToEdit = ref<TMessage | null>(null)
  const chatsLoading = ref(false)

  const messages = computed(() => currentChat.value ? cachedMessages.value[currentChat.value.chat_id] || [] : [])

  const lastReadMessage = computed(() => {
    const lastReadIndex = messages.value.findIndex(
      (message, index) => messages.value[index - 1]?.read &&
       !message.read && message.users.id !== currentUser.value?.id) - 1

    return messages.value[lastReadIndex]
  })

  const chatsToShow = computed(() => {
    const _chats = foundChats.value ? foundChats.value : chats.value

    const chatsArray = Object.keys(_chats).map(key => _chats[key])
    chatsArray.sort((ch1, ch2) => new Date(ch2.updated_at).getTime() - new Date(ch1.updated_at).getTime())

    return chatsArray
  })

  async function loadMessageBatch (chatId: string) {
    const messageBatch = await chatService.getMessages(cachedMessages.value[chatId]?.length,
      cachedMessages.value[chatId]?.length + maxMessagesPerRequest, chatId)

    cachedMessages.value[chatId] = [...messageBatch.reverse(), ...cachedMessages.value[chatId] || []]
  }

  async function getChats () {
    if (currentUser.value) {
      const fetchedChats = await chatService.getChatsViews(currentUser.value.id)

      chats.value = parseArrayToObject(fetchedChats, 'chat_id')

      return fetchedChats
    }
  }

  async function findChat (searchQuery: string) {
    if (!currentUser.value) {
      throw new Error('Error finding chats')
    }

    const fetchedChats = await chatService.findChats(searchQuery, currentUser.value.id) as TChatData

    foundChats.value = parseArrayToObject(fetchedChats, 'chat_id')
  }

  async function deleteChat () {
    if (!currentChat.value) {
      throw new Error('Select chat to delete')
    }

    await chatService.deleteChat(currentChat.value.chat_id)
  }

  return {
    maxMessagesPerRequest,
    chats,
    foundChats,
    cachedMessages,
    messages,
    currentChat,
    messageToEdit,
    lastReadMessage,
    chatsToShow,
    chatsLoading,
    loadMessageBatch,
    getChats,
    findChat,
    deleteChat
  }
})
