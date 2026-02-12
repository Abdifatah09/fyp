import { api } from "./api";

export const subscriptionService = {
  subscribe: (difficultyId) => api.post(`/subscriptions/difficulty/${difficultyId}`).then((r) => r.data),
  unsubscribe: (difficultyId) => api.delete(`/subscriptions/difficulty/${difficultyId}`).then((r) => r.data),
  mine: () => api.get(`/subscriptions/mine`).then((r) => r.data),
};
