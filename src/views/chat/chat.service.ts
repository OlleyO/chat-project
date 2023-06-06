class ChatService {
  async getUsers () {
    const { data, error } = await useSupabase().from('users').select()

    if (error) {
      throw error
    }

    return data
  }

  async getChatsViews (userId: string, chatId?: string) {
    let query = useSupabase().rpc('get_chats', {
      current_user_id: userId
    })

    if (chatId) {
      query = query.eq('chat_id', chatId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data
  }

  async getMessages (from: number, to: number, chatId: string) {
    const { data, error } = await useSupabase().from('messages').select(`
    id,
    chat_id,
    message,
    created_at,
    read,
    users(id, fullname, username, avatar_url)
    `
    ).eq('chat_id', chatId).order('created_at', { ascending: false }).range(from, to)

    if (error) {
      throw error
    }

    return data
  }

  onNewMessage (handler: (...args: any[]) => void) {
    useSupabase().channel(supabaseChannels.dbMessages).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
      const { data, error } = await useSupabase().from('users').select().eq('id', payload.new.sender_id)

      if (error) {
        throw error
      }

      handler({
        ...payload.new,
        users: data[0]
      })
    }).subscribe()
  }

  async createNewMessage (message: IDatabase['public']['Tables']['messages']['Insert']) {
    const { data, error } = await useSupabase().from('messages').insert(message)

    if (error) {
      throw error
    }

    return data
  }

  onUpdateMessage (handler: (...args: any[]) => void) {
    useSupabase().channel(supabaseChannels.dbMessagesUpdate).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
      handler(payload.new)
    }).subscribe()
  }

  async markMessageAsRead (messageId: string) {
    const { data, error } = await useSupabase().from('messages').update({
      read: true
    }).eq('id', messageId)

    if (error) {
      throw error
    }

    return data
  }

  async findChats (searchQuery: string, userId: string) {
    const { data, error } = await useSupabase().rpc('username_fullname_tagname_new', {
      search_query: searchQuery,
      user_id: userId
    })

    if (error) {
      throw error
    }

    return data
  }

  async createNewChat (chatId: string, userId: string, creatorId: string) {
    const { error: error1 } = await useSupabase().from('chats').insert({
      id: chatId
    })

    if (error1) {
      throw error1
    }

    const { error: error2 } = await useSupabase().from('chat_to_user').insert([{
      chat_id: chatId,
      user_id: userId
    }, {
      chat_id: chatId,
      user_id: creatorId
    }])

    if (error2) {
      throw error2
    }
  }

  onNewChat (handler: (...args: any[]) => void, currentUserId: string) {
    useSupabase().channel(supabaseChannels.dbChats).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, async (payload) => {
      const chats = await this.getChatsViews(currentUserId, payload.new.chat_id)

      handler(chats[0])
    }).subscribe()
  }
}

export const chatService = new ChatService()
