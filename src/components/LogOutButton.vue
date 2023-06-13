<template>
  <el-button :type="$elComponentType.danger" text @click="logOut()">Log Out</el-button>
</template>

<script lang="ts" setup>
const { logOut } = useAuthStore()
</script>
