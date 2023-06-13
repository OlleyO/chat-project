<template>
  <div class="p-5">
    <header class="flex items-center justify-between">
      <h1>Reports</h1>

      <el-button :type="$elComponentType.primary" @click="$router.push({ name: $routeNames.chat })">Home</el-button>
    </header>

    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="System" name="system">
        <el-table :data="systemReports" border style="width: 100%">
          <el-table-column prop="id" label="ID" />
          <el-table-column prop="reason" label="Report Reason" />
          <el-table-column prop="created_at" label="Issued">
            <template #default="{ row }">
              {{ new Intl.DateTimeFormat('en', {
                dateStyle: 'full'
              }).format(new Date(row.created_at)) }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="Users" name="users">
        <el-table :data="userReports" border style="width: 100%">
          <el-table-column prop="id" label="ID" />
          <el-table-column prop="users.fullname" label="Fullname" width="180" />

          <el-table-column prop="users.username" label="Username" width="180" />

          <el-table-column prop="reason" label="Report Reason" />

          <el-table-column prop="created_at" label="Issued">
            <template #default="{ row }">
              {{ new Intl.DateTimeFormat('en', {
                dateStyle: 'full'
              }).format(new Date(row.created_at)) }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
const adminStore = useAdminStore()
const { systemReports, userReports } = storeToRefs(adminStore)
const { getReports } = adminStore

const activeTab = ref('system')

onBeforeMount(async () => {
  getReports()
})
</script>
