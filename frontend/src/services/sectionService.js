import { api } from "./api";

export const sectionService = {
  create: (payload) => api.post("/sections", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/sections/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/sections/${id}`).then((r) => r.data),
  getAll: () => api.get("/sections").then((r) => r.data),
  getById: (id) => api.get(`/sections/${id}`).then((r) => r.data),
  getByDifficulty: (difficultyId) => api.get(`/sections?difficultyId=${difficultyId}`).then((r) => r.data),
};
