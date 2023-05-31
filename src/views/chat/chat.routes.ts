import { routeNames } from '@/router/route-names'
import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

export const chatRouteNames = {
  chat: 'chat',
  chatRoom: 'chatRoom'
}

const chatGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const chatStore = useChatStore()
  const { contactData } = storeToRefs(chatStore)
  const { getChats } = chatStore

  await getChats()

  if (contactData.value.length) {
    next({
      name: routeNames.chatRoom,
      params: {
        id: contactData.value[0].id
      },
      replace: true
    })
  } else {
    next()
  }
}

export const chatRoomGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  beforeEnter = false
) => {
  const chatStore = useChatStore()
  const { chats, messages } = storeToRefs(chatStore)
  const { loadMessageBatch, getChats, markAsRead } = chatStore

  const chatId = to.params.id as string

  if (beforeEnter) {
    await getChats()
  }

  await loadMessageBatch(chatId)

  await chatService.onNewMessage((newMessage) => {
    if (chatId === newMessage.chat_id) {
      messages.value = [...messages.value, { ...newMessage, read: false }]
    }

    const chatIndex = chats.value.findIndex((ch) => ch.id === newMessage.chat_id)
    const ch = { ...chats.value[chatIndex] }
    ch.messages = [...ch.messages, { ...newMessage, read: false }]

    const copy = [...chats.value]
    copy.splice(chatIndex, 1)
    chats.value = [ch, ...copy]
  })

  await chatService.onUpdateMessage((updatedMessage) => {
    markAsRead(updatedMessage)
  })

  next()
}

export const chatRoutes: Array<RouteRecordRaw> = [
  {
    path: '/chat',
    name: chatRouteNames.chat,
    component: () => import('./Chat.vue'),
    meta: {
      requireAuth: true
    },
    beforeEnter: chatGuard
  },
  {
    path: '/chat/:id',
    name: chatRouteNames.chatRoom,
    component: () => import('./Chat.vue'),
    meta: {
      requireAuth: true
    },
    beforeEnter: (to, from, next) => chatRoomGuard(to, from, next, true)
  }
]
