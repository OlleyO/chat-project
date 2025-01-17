import { routeNames } from '@/router/route-names'
import { RealtimeChannel, type User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('authStore', () => {
  const currentUser = ref<User | null>(null)
  const onlineUsers = ref<IOnlineUsers>({})

  const router = useRouter()

  let channel: RealtimeChannel | null = null

  async function logIn (payload: IAuthWithEmailAndPasswordPayload) {
    await authService.loginWithEmailAndPassword(payload)
  }

  async function register (payload: TAuthWithEmailAndPasswordPayload) {
    await authService.registerWithEmailAndPassword(payload)
  }

  async function loadUser () {
    currentUser.value = await authService.loadUser()
  }

  async function logOut () {
    await authService.logOut()
    currentUser.value = null
    router.replace({ name: 'login' })
  }

  function clearUser () {
    currentUser.value = null
  }

  async function sendPasswordResetEmail (email: string) {
    await authService.sendPasswordResetEmail(email)
  }

  async function resetPassword (password: string) {
    await authService.resetPassword(password)
  }

  function startListenToAuthStateChange () {
    useSupabase().auth.onAuthStateChange((event, session) => {
      if (!session && currentUser.value && event !== 'SIGNED_OUT') {
        notificationHandler('Session expired')
        return router.replace({ name: routeNames.login })
      }

      switch (event) {
        case 'USER_UPDATED':
          loadUser()
          break
        case 'INITIAL_SESSION':
        case 'SIGNED_IN':
          currentUser.value = session?.user || null
          trackOnlineStatus()
          break
        case 'SIGNED_OUT':
          clearUser()
          channel?.untrack()
          break
      }
    })
  }

  function trackOnlineStatus () {
    if (currentUser.value) {
      channel = authService.initializeOnlineChannel(currentUser.value?.id)
      channel?.on('presence', { event: 'join' }, ({ newPresences }) => {
        onlineUsers.value = {
          ...onlineUsers.value,
          [newPresences[0].id]: true
        }
      })

      channel?.on('presence', { event: 'leave' }, ({ leftPresences }) => {
        onlineUsers.value = {
          ...onlineUsers.value,
          [leftPresences[0].id]: false
        }
      })

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel?.track({
            id: currentUser?.value?.id
          })
        }
      })
    }
  }

  return {
    currentUser,
    onlineUsers,
    logIn,
    register,
    loadUser,
    logOut,
    clearUser,
    sendPasswordResetEmail,
    resetPassword,
    startListenToAuthStateChange
  }
})
