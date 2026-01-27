import { api } from "./api";

export const challengeService = {
  create: (payload) => api.post("/challenges", payload).then(res => res.data),
  update: (id, payload) => api.put(`/challenges/${id}`, payload).then(res => res.data),
  remove: (id) => api.delete(`/challenges/${id}`).then(res => res.data),
  getAll: () => api.get("/challenges").then(res => res.data),
  getBySection: (sectionId) => api.get(`/challenges?sectionId=${sectionId}`).then(res => res.data),
  getById: (id) => api.get(`/challenges/${id}`).then(res => res.data), 
};
