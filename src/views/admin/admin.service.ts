class AdminService {
  async getReports () {
    const { data, error } = await useSupabase().from('reports').select(`
    id,
    reason,
    users (
      fullname,
      username
    ),
    created_at
    `)

    if (error) {
      throw error
    }

    return data
  }
}

export const adminService = new AdminService()
