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
      @openCreateReportForm="onReportChat"
    />
    <div class="md:pl-[240px] lg:pl-[320px] pt-14 h-full px-0 ">
      <router-view />
    </div>

    <ReportForm
      v-model="createReportFormVisible"
      :chat="chatToReport"
      @afterSubmit="resetReportData"
    />
  </div>
</template>

<script lang="ts" setup>const { currentUser, onlineUsers } = storeToRefs(useAuthStore())
const chatStore = useChatStore()
const { currentChat } = storeToRefs(chatStore)
const { deleteChat } = chatStore

const leftSidebarOpen = ref(false)
const rightDrawer = ref(false)
const createReportFormVisible = ref(false)
const chatToReport = ref<TCurrentChat>()

async function handleDeleteChat () {
  try {
    await deleteChat()
  } catch (err) {
    notificationHandler(err as TAppError)
  } finally {
    rightDrawer.value = false
  }
}

function onReportChat (chat: TCurrentChat) {
  createReportFormVisible.value = true
  chatToReport.value = chat
}

function resetReportData () {
  chatToReport.value = null
}
</script>
