import { api } from "./api";

export const badgeService = {
  me: () => api.get("/badges/me").then((r) => r.data),
  list: () => api.get("/badges").then((r) => r.data), 
};