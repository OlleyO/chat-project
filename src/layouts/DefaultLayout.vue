<template>
  <div class="h-full overflow-hidden max-w-[1440px]">
    <LeftSidebar
      :onlineUsers="onlineUsers"
      :open="leftSidebarOpen"
      @onClose="leftSidebarOpen=false"
      @openCreateGroupForm="createGroupFormVisible = true"
    />

    <Header
      :currentChat="currentChat"
      :currentUser="currentUser"
      @onMenuClick="leftSidebarOpen=!leftSidebarOpen" @onInfoClick="rightDrawer=true"
    />

    <RightSidebar
      v-model="rightDrawer"
      :currentChat="currentChat"
      @deleteChat="handleDeleteConversation"
    />
    <div class="md:pl-[240px] lg:pl-[320px] pt-14 h-full px-0 ">
      <router-view />
    </div>

    <ChatForm
      v-model="createGroupFormVisible"
      :creatorId="currentUser?.id"
    />
  </div>
</template>

<script lang="ts" setup>
const leftSidebarOpen = ref(false)
const rightDrawer = ref(false)
const createGroupFormVisible = ref(false)

const chatStore = useChatStore()

const { currentUser, onlineUsers } = storeToRefs(useAuthStore())
const { currentChat } = storeToRefs(chatStore)
const { deleteConversation } = chatStore

async function handleDeleteConversation () {
  await deleteConversation()
  rightDrawer.value = false
}
</script>
