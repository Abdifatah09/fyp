import { api } from "./api";

export const gamificationService = {
  me: () => api.get("/gamification/me").then((r) => r.data),
};
