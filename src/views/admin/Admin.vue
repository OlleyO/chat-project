<template>
  <div class="p-5">
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="Reports" name="reports">
        <h1>Reports</h1>
        <el-table :data="reports" border style="width: 100%">
          <el-table-column prop="users.fullname" label="Fullname" width="180" />
          <el-table-column prop="users.username" label="Username" width="180" />
          <el-table-column prop="reason" label="Report Reason" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Users" name="users">
        Not implemented yet
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
const adminStore = useAdminStore()
const { reports } = storeToRefs(adminStore)
const { getReports } = adminStore

const activeTab = ref('reports')

onBeforeMount(async () => {
  getReports()
})
</script>
