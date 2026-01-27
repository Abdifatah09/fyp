import { api } from "./api";

export const subjectService = {
  create: (payload) =>api.post("/subjects", payload).then(res => res.data),
  update: (id, payload) => api.put(`/subjects/${id}`, payload).then(res => res.data),
  remove: (id) => api.delete(`/subjects/${id}`).then(res => res.data),
  getAll: () => api.get("/subjects").then(res => res.data),
  getById: (id) =>api.get(`/subjects/${id}`).then(res => res.data),
};
