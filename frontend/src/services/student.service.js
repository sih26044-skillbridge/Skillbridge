import api from './api';

export const studentService = {
  async getProfile() {
    const response = await api.get('/students/profile/');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/students/profile/', profileData);
    return response.data;
  },

  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/students/upload-resume/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getSkills() {
    const response = await api.get('/students/skills/');
    return response.data;
  },

  async addSkill(skillName, category = 'General') {
    const response = await api.post('/students/skills/', { name: skillName, category });
    return response.data;
  },

  async deleteSkill(skillId) {
    const response = await api.delete(`/students/skills/${skillId}/`);
    return response.data;
  },
};
