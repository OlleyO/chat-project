<template>
  <!--
    This layout is just an example.
    Please create your own depending on your projects needs
  -->
  <div class="h-full overflow-hidden max-w-[1440px]">
    <LeftSidebar
      :onlineUsers="onlineUsers"
      :open="leftSidebarOpen"
      @onClose="leftSidebarOpen=false"
    />

    <Header
      :currentChat="currentChat"
      :currentUser="currentUser"
      @onMenuClick="leftSidebarOpen=!leftSidebarOpen" @onInfoClick="rightDrawer=true"
    />

    <RightSidebar
      v-model="rightDrawer"
      :currentChat="currentChat"
    />
    <div class="md:pl-[240px] lg:pl-[320px] pt-14 h-full px-0 ">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import LeftSidebar from '@/components/LeftSidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'

const leftSidebarOpen = ref(false)
const rightDrawer = ref(false)

const authStore = useAuthStore()
const chatStore = useChatStore()

const { currentUser, onlineUsers } = storeToRefs(authStore)
const { currentChat } = storeToRefs(chatStore)
</script>
