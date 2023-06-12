import { chatService } from './chat.service'

export const useChatStore = defineStore('chatStore', () => {
  const authStore = useAuthStore()
  const { currentUser } = storeToRefs(authStore)

  const maxMessagesPerRequest = 20

  const chats = ref<TChatsTransformed>({})
  const foundChats = ref<TChatsTransformed | null>(null)
  const messages = ref<IMessage[]>([])
  const currentChat = ref<TCurrentChat>()
  const messageToEdit = ref<IMessage | null>(null)

  const chatsLoading = ref(false)

  const lastReadMessage = computed(() => {
    const lastReadIndex = messages.value.findIndex(
      (message, index) => messages.value[index - 1]?.read && !message.read) - 1

    return messages.value[lastReadIndex]
  })

  const chatsToShow = computed(() => {
    const _chats = foundChats.value ? foundChats.value : chats.value

    const chatsArray = Object.keys(_chats).map(key => _chats[key])
    chatsArray.sort((ch1, ch2) => new Date(ch2.updated_at).getTime() - new Date(ch1.updated_at).getTime())

    return chatsArray
  })

  async function loadMessageBatch (chatId: string) {
    const messageBatch = await chatService.getMessages(messages.value.length,
      messages.value.length + maxMessagesPerRequest, chatId) as unknown as IMessage[]

    messages.value = [...messageBatch.reverse(), ...messages.value]
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
    chats,
    foundChats,
    messages,
    currentChat,
    messageToEdit,
    chatsLoading,
    lastReadMessage,
    chatsToShow,
    loadMessageBatch,
    getChats,
    findChat,
    deleteChat
  }
})
