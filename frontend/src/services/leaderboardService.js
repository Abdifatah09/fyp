import { api } from "./api";

export const leaderboardService = {
  global: (limit = 5) => api.get(`/leaderboard?limit=${limit}`).then((r) => r.data),
};
