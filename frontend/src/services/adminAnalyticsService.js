import { api } from "./api";

export const adminAnalyticsService = {
  getOverview: (days = 30) =>
    api.get(`/admin/analytics/overview?days=${days}`).then(res => res.data),

  getDailyAttempts: (days = 30) =>
    api.get(`/admin/analytics/daily-attempts?days=${days}`).then(res => res.data),

  getCompletionsBySubjectDifficulty: (days = 30) =>
    api.get(`/admin/analytics/completions-by-subject-difficulty?days=${days}`).then(res => res.data),

  getHardestChallenges: (days = 30, limit = 10) =>
    api.get(`/admin/analytics/hardest-challenges?days=${days}&limit=${limit}`).then(res => res.data),

  getAvgAttemptsUntilSuccess: (days = 30) =>
    api.get(`/admin/analytics/avg-attempts-until-success?days=${days}`).then(res => res.data),

  getAvgTimeToComplete: (days = 30) =>
    api.get(`/admin/analytics/avg-time-to-complete?days=${days}`).then(res => res.data),
};