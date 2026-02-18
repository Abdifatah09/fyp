import { api } from "./api";

export const achievementService = {

  me: () => api.get("/achievements/me").then((r) => r.data),

};
