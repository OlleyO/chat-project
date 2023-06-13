import { supabaseChannels } from '@/composables/supabase'

class AuthService {
  async loginWithEmailAndPassword (payload: IAuthWithEmailAndPasswordPayload) {
    const { data, error } = await useSupabase().auth.signInWithPassword(payload)

    if (error) {
      throw error
    }

    return data
  }

  async registerWithEmailAndPassword ({ email, password, ...rest }: TAuthWithEmailAndPasswordPayload) {
    const { data, error } = await useSupabase().auth.signUp({
      email,
      password,
      options: {
        data: {
          ...rest,
          tagname: `@${rest.username}`,
          bio: ''
        }
      }
    })

    if (error) {
      throw error
    }

    return data
  }

  async logOut () {
    const { error } = await useSupabase().auth.signOut()

    if (error) {
      throw error
    }
  }

  async loadUser () {
    const { data: { user }, error } = await useSupabase().auth.getUser()

    if (error) {
      throw error
    }

    return user
  }

  async sendPasswordResetEmail (email: string) {
    const { error } = await useSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: '/auth/reset-password'
    })

    if (error) {
      throw error
    }
  }

  async resetPassword (password: string) {
    const { error } = await useSupabase().auth.updateUser({
      password
    })

    if (error) {
      throw error
    }
  }

  initializeOnlineChannel (userId: string) {
    const channel = useSupabase().channel(supabaseChannels.onlineUsers, {
      config: {
        presence: {
          key: userId
        }
      }
    })

    return channel
  }
}

export const authService = new AuthService()
