import { api } from "./api";

export const profileService = {
  me: () => api.get("/profile/me").then((r) => r.data),
  create: (payload) => api.post("/profile", payload).then((r) => r.data),
  getByUserId: (userId) => api.get(`/profile/${userId}`).then((r) => r.data),
  updateByUserId: (userId, payload) => api.put(`/profile/${userId}`, payload).then((r) => r.data),
};



