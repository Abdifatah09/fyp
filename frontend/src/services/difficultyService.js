import { api } from "./api";

export const difficultyService = {
  create: (payload) => api.post("/difficulties", payload).then(res => res.data),
  getAll: () => api.get("/difficulties").then(res => res.data),
  getBySubject: (subjectId) => api.get(`/difficulties?subjectId=${subjectId}`).then(res => res.data),
  remove: (id) => api.delete(`/difficulties/${id}`).then(res => res.data),
};
