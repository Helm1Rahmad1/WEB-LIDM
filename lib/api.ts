import apiClient from './api-client';

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'guru' | 'murid';
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string; role: string }) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/api/auth/logout');
  },

  getUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },
};

export const roomsApi = {
  getRooms: async () => {
    const response = await apiClient.get('/api/rooms');
    return response.data.rooms;
  },

  createRoom: async (data: { name: string; description: string; code: string }) => {
    const response = await apiClient.post('/api/rooms', data);
    return response.data.room;
  },

  joinRoom: async (code: string) => {
    const response = await apiClient.post('/api/rooms/join', { code });
    return response.data;
  },

  getStudents: async (roomId: string) => {
    const response = await apiClient.get(`/api/rooms/${roomId}/students`);
    return response.data.students;
  },
};

export const progressApi = {
  getLetterProgress: async (roomId: string) => {
    const response = await apiClient.get(`/api/progress/letter?roomId=${roomId}`);
    return response.data.progress;
  },

  getJilidProgress: async (roomId: string) => {
    const response = await apiClient.get(`/api/progress/jilid?roomId=${roomId}`);
    return response.data.progress;
  },

  updateLetterProgress: async (data: { roomId: number; hijaiyahId: number; status: string }) => {
    const response = await apiClient.post('/api/progress/letter', data);
    return response.data.progress;
  },
};

export const testsApi = {
  getTests: async (roomId: string) => {
    const response = await apiClient.get(`/api/tests?roomId=${roomId}`);
    return response.data.tests;
  },

  submitTest: async (data: { roomId: number; hijaiyahId: number; jilidId?: number; score: number; status: string }) => {
    const response = await apiClient.post('/api/tests', data);
    return response.data.test;
  },
};

export const hijaiyahApi = {
  getLetters: async () => {
    const response = await apiClient.get('/api/hijaiyah');
    return response.data.letters;
  },

  getLetter: async (id: string) => {
    const response = await apiClient.get(`/api/hijaiyah/${id}`);
    return response.data.letter;
  },
};

export const jilidApi = {
  getJilid: async () => {
    const response = await apiClient.get('/api/jilid');
    return response.data.jilid;
  },

  getJilidById: async (id: string) => {
    const response = await apiClient.get(`/api/jilid/${id}`);
    return response.data.jilid;
  },

  getJilidLetters: async (id: string) => {
    const response = await apiClient.get(`/api/jilid/${id}/letters`);
    return response.data.letters;
  },
};
