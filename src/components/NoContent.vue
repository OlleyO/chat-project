<template>
  <h1 class="text-xl font-semibold text-system-info">{{ message }}</h1>
</template>

<script lang="ts" setup>
defineProps<{
  message: string
}>()
</script>
