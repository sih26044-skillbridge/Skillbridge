import api from './api';

export const adminService = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard/');
    return response.data;
  },

  async getUsers(role = '') {
    const params = role ? { role } : {};
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },

  async toggleJobActive(jobId) {
    const response = await api.patch(`/admin/jobs/${jobId}/toggle-active/`);
    return response.data;
  },
};
