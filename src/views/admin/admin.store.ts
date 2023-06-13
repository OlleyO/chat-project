export const useAdminStore = defineStore('adminStore', () => {
  const reports = ref<TReport[]>([])

  const systemReports = computed(() => reports.value.filter(report => !(report.users)))
  const userReports = computed(() => reports.value.filter(report => !!report.users))

  async function getReports () {
    reports.value = await adminService.getReports()
  }

  return {
    reports,
    userReports,
    systemReports,
    getReports
  }
})
