type TJson =
  | string
  | number
  | boolean
  | null
  | { [key: string]: TJson }
  | TJson[]

interface IDatabase {
  public: {
    Tables: {
      chat_to_user: {
        Row: {
          chat_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chat_to_user_chat_id_fkey'
            columns: ['chat_id']
            referencedRelation: 'chats'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_to_user_chat_id_fkey'
            columns: ['chat_id']
            referencedRelation: 'chats_view'
            referencedColumns: ['chat_id']
          },
          {
            foreignKeyName: 'chat_to_user_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_to_user_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'chats_view'
            referencedColumns: ['user_id']
          }
        ]
      }
      chats: {
        Row: {
          admin_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chats_admin_id_fkey'
            columns: ['admin_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chats_admin_id_fkey'
            columns: ['admin_id']
            referencedRelation: 'chats_view'
            referencedColumns: ['user_id']
          }
        ]
      }
      messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          message: string
          read: boolean
          sender_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_chat_id_fkey'
            columns: ['chat_id']
            referencedRelation: 'chats'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_chat_id_fkey'
            columns: ['chat_id']
            referencedRelation: 'chats_view'
            referencedColumns: ['chat_id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            referencedRelation: 'chats_view'
            referencedColumns: ['user_id']
          }
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reports_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'chats_view'
            referencedColumns: ['user_id']
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          fullname: string
          id: string
          tagname: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          fullname: string
          id: string
          tagname: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          fullname?: string
          id?: string
          tagname?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      chats_view: {
        Row: {
          avatar_url: string | null
          bio: string | null
          chat_created_at: string | null
          chat_id: string | null
          description: string | null
          fullname: string | null
          message: string | null
          message_created_at: string | null
          message_id: string | null
          tagname: string | null
          type: string | null
          unread_messages_count: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Functions: {
      delete_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      get_chats: {
        Args: {
          current_user_id: string
        }
        Returns: {
          chat_id: string
          chat_created_at: string
          type: string
          description: string
          updated_at: string
          message_id: string
          message_created_at: string
          message: string
          user_id: string
          bio: string
          fullname: string
          tagname: string
          username: string
          avatar_url: string
          unread_messages_count: number
          admin_id: string
          name: string
        }[]
      }
      get_chats_new: {
        Args: {
          current_user_id: string
        }
        Returns: {
          chat_id: string
          chat_created_at: string
          type: string
          description: string
          updated_at: string
          message_id: string
          message_created_at: string
          message: string
          user_id: string
          bio: string
          fullname: string
          tagname: string
          username: string
          avatar_url: string
          unread_messages_count: number
          admin_id: string
          name: string
        }[]
      }
      helper: {
        Args: {
          current_user_id: string
        }
        Returns: {
          chat_id: string
          chat_created_at: string
          type: string
          description: string
          updated_at: string
          message_id: string
          message_created_at: string
          message: string
          user_id: string
          bio: string
          fullname: string
          tagname: string
          username: string
          avatar_url: string
          unread_messages_count: number
          admin_id: string
          name: string
        }[]
      }
      helper_chat_getter: {
        Args: {
          current_user_id: string
        }
        Returns: Database['public']['CompositeTypes']['tmp_type'][]
      }
      helper_new: {
        Args: {
          current_user_id: string
        }
        Returns: {
          chat_id: string
          chat_created_at: string
          type: string
          description: string
          updated_at: string
          message_id: string
          message_created_at: string
          message: string
          user_id: string
          bio: string
          fullname: string
          tagname: string
          username: string
          avatar_url: string
          unread_messages_count: number
          admin_id: string
          name: string
        }[]
      }
      helper_new_new: {
        Args: {
          current_user_id: string
        }
        Returns: Database['public']['CompositeTypes']['tmp_type'][]
      }
      username_fullname_tagname:
      | {
        Args: {
          '': unknown
        }
        Returns: string
      }
      | {
        Args: {
          user_id: string
        }
        Returns: string
      }
      | {
        Args: {
          search_query: string
          user_id: string
        }
        Returns: {
          chat_id: string
          chat_created_at: string
          type: string
          description: string
          updated_at: string
          message_id: string
          message_created_at: string
          message: string
          user_id: string
          bio: string
          fullname: string
          tagname: string
          username: string
          avatar_url: string
          unread_messages_count: number
        }[]
      }
      username_fullname_tagname_new: {
        Args: {
          search_query: string
          user_id: string
        }
        Returns: {
          chat_id: string
          chat_created_at: string
          type: string
          description: string
          updated_at: string
          message_id: string
          message_created_at: string
          message: string
          user_id: string
          bio: string
          fullname: string
          tagname: string
          username: string
          avatar_url: string
          unread_messages_count: number
          admin_id: string
          name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      temp_type: {
        chat_id: string
        chat_created_at: string
        type: string
        description: string
        updated_at: string
        message_id: string
        message_created_at: string
        message: string
        user_id: string
        bio: string
        fullname: string
        tagname: string
        username: string
        avatar_url: string
        unread_messages_count: number
      }
      tmp_type: {
        chat_id: string
        chat_created_at: string
        type: string
        description: string
        updated_at: string
        message_id: string
        message_created_at: string
        message: string
        user_id: string
        bio: string
        fullname: string
        tagname: string
        username: string
        avatar_url: string
        unread_messages_count: number
        admin_id: string
        name: string
      }
    }
  }
}
