import axios from "axios";

const API_URL = "http://localhost:5001";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Auth API
export const auth = {
  register: async (data: { email: string; password: string; name: string }) =>
    api.post("/auth/register", data),

  login: async (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: async () => api.post("/auth/logout"),

  getCurrentUser: async () => api.get("/auth/me"),

  googleLogin: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  facebookLogin: () => {
    window.location.href = `${API_URL}/auth/facebook`;
  },
};

// Golf Scores API
export const scores = {
  getAll: async () => api.get("/scores"),

  getOne: async (id: string) => api.get(`/scores/${id}`),

  create: async (data: {
    holeScores: number[];
    club?: string;
    notes?: string;
  }) => api.post("/scores", data),

  update: async (
    id: string,
    data: {
      holeScores?: number[];
      notes?: string;
    }
  ) => api.put(`/scores/${id}`, data),

  delete: async (id: string) => api.delete(`/scores/${id}`),
};

// Clubs API
export const clubs = {
  getAll: async () => api.get("/clubs"),

  getOne: async (id: string) => api.get(`/clubs/${id}`),

  create: async (data: { name: string; description?: string }) =>
    api.post("/clubs", data),

  join: async (id: string) => api.post(`/clubs/${id}/join`),

  getStats: async (id: string, date?: string) => {
    const params = date ? { date } : {};
    return api.get(`/clubs/${id}/stats`, { params });
  },
};

export default api;
