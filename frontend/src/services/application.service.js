import api from './api';

export const applicationService = {
  async applyJob(jobId, coverLetter = '') {
    const response = await api.post('/applications/', {
      job_id: jobId,
      cover_letter: coverLetter,
    });
    return response.data;
  },

  async getMyApplications() {
    const response = await api.get('/applications/my/');
    return response.data;
  },

  async updateStatus(applicationId, newStatus) {
    const response = await api.patch(`/applications/${applicationId}/status/`, {
      status: newStatus,
    });
    return response.data;
  },
};
