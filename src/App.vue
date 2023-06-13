<template>
  <ElConfigProvider>
    <router-view />
  </ElConfigProvider>
</template>

<script lang="ts" setup>
const { startListenToAuthStateChange } = useAuthStore()

onMounted(() => {
  startListenToAuthStateChange()
})
</script>
