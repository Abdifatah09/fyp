import { api } from "./api";

export const progressService = {
  getMyProgress: () => api.get("/progress/me").then((res) => res.data),

  getByChallenge: () => api.get("/progress/me/by-challenge").then((res) => res.data),

  getSectionsProgress: () => api.get("/progress/me/sections").then((res) => res.data),

  getSectionDetail: (sectionId) => api.get(`/progress/me/sections/${sectionId}`).then((res) => res.data),

  getDifficultiesProgress: () =>  api.get("/progress/me/difficulties").then((res) => res.data),

  getDifficultyDetail: (difficultyId) => api.get(`/progress/me/difficulties/${difficultyId}`).then((res) => res.data),

  getSubjectsProgress: () => api.get("/progress/me/subjects").then((res) => res.data),

  getSubjectDetail: (subjectId) => api.get(`/progress/me/subjects/${subjectId}`).then((res) => res.data),

  getMyCompletedChallengeIds: () => api.get("/progress/me/completed-challenges").then((res) => res.data),
};
