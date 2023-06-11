<template>
  <div class="h-full overflow-hidden max-w-[1440px]">
    <LeftSidebar
      :onlineUsers="onlineUsers"
      :open="leftSidebarOpen"
      @onClose="leftSidebarOpen=false"
      @openCreateReportForm="createReportFormVisible = true"
    />

    <Header
      :currentChat="currentChat"
      :currentUser="currentUser"
      @onMenuClick="leftSidebarOpen=!leftSidebarOpen"
      @onInfoClick="rightDrawer=true"
    />

    <RightSidebar
      v-model="rightDrawer"
      :currentChat="currentChat"
      @deleteChat="handleDeleteChat"
    />
    <div class="md:pl-[240px] lg:pl-[320px] pt-14 h-full px-0 ">
      <router-view />
    </div>

    <ReportForm
      v-model="createReportFormVisible"
      :chat="currentChat"
    />
  </div>
</template>

<script lang="ts" setup>
const leftSidebarOpen = ref(false)
const rightDrawer = ref(false)
const createReportFormVisible = ref(false)

const chatStore = useChatStore()

const { currentUser, onlineUsers } = storeToRefs(useAuthStore())
const { currentChat } = storeToRefs(chatStore)
const { deleteChat } = chatStore

async function handleDeleteChat () {
  try {
    await deleteChat()
  } catch (err) {
    notificationHandler(err as TAppError)
  } finally {
    rightDrawer.value = false
  }
}
</script>
