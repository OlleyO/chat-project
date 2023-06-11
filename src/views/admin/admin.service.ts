class AdminService {
  async getReports () {
    const { data, error } = await useSupabase().from('reports').select(`
    reason,
    users (
      fullname,
      username
    )
    `)

    if (error) {
      throw error
    }

    return data
  }
}

export const adminService = new AdminService()
