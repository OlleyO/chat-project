<template>
  <ElConfigProvider
    :locale="{
      name: locale,
      el: messages[locale]?.el
    }"
  >
    <router-view />
  </ElConfigProvider>
</template>

<script lang="ts" setup>
const { messages, locale } = useI18n()

const { startListenToAuthStateChange } = useAuthStore()

onMounted(() => {
  startListenToAuthStateChange()
})
</script>
