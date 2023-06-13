type TGetMessagesDataType = TArrayElement<Awaited<ReturnType<typeof chatService.getMessages>>>

type TMessage = TGetMessagesDataType

type TChatData = IDatabase['public']['Functions']['get_chats']['Returns']

type TChatItem = TArrayElement<TChatData>

type TCurrentChat = TChatItem | null | undefined

type TChatsTransformed = {
  [key: string]: TChatItem
}

type TCachedMessages = {
  [key: string]: IMessage[]
}
