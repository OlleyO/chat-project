type TGetMessagesDataType = TArrayElement<Awaited<ReturnType<typeof chatService.getMessages>>>

interface IMessage extends TGetMessagesDataType {
  users: TArrayElement<TGetMessagesDataType['users']>
}

type TChatData = IDatabase['public']['Functions']['get_chats']['Returns']

type TChatItem = TArrayElement<TChatData>

type TCurrentChat = TChatItem | null | undefined
