import { RealtimeChannel, type User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('authStore', () => {
  const currentUser = ref<User | null>(null)
  const onlineUsers = ref<IOnlineUsers>({})

  const isAuthenticated = computed(() => !!currentUser)

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
      if (!session) {
        router.replace({ name: 'login' })
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
        console.log('Users have left: ', leftPresences)
        onlineUsers.value = {
          ...onlineUsers.value,
          [leftPresences[0].id]: false
        }
      })

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel?.track({
            online_at: new Date().toISOString(),
            id: currentUser?.value?.id
          })
        }
      })
    }
  }

  return {
    currentUser,
    onlineUsers,
    isAuthenticated,
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
