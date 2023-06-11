export const useAdminStore = defineStore('adminStore', () => {
  const reports = ref<TReport[]>([])

  async function getReports () {
    reports.value = await adminService.getReports()
  }

  return {
    reports,
    getReports
  }
})
