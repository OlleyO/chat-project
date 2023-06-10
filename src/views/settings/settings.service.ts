class SettingsService {
  async uploadAvatar (avatar: File) {
    const { data, error } = await useSupabase()
      .storage
      .from('images')
      .upload(`avatars/${avatar.name}`, avatar, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      throw error
    }

    return data
  }

  async updateProfile ({ email, ...rest }: IProfile) {
    const { data, error } = await useSupabase().auth.updateUser({
      email,
      data: rest
    })

    if (error) {
      throw error
    }

    return data
  }

  async getAvatarUrl (path: string) {
    const { data } = useSupabase().storage.from('images').getPublicUrl(path)

    return data
  }

  async deleteAvatar (avatarPath: string) {
    const { data, error } = await useSupabase()
      .storage
      .from('images')
      .remove([avatarPath])

    if (error) {
      throw error
    }

    return data
  }

  async deleteAccount (userId: string) {
    const { error } = await useSupabase().rpc('delete_user', {
      user_id: userId
    })

    if (error) {
      throw error
    }
  }
}

export const settingsService = new SettingsService()
