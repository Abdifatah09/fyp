import { api } from "./api";

export const judgeService = {
  submit: ({ challengeId, languageId, sourceCode, stdin }) =>
    api
      .post("/judge/submit", { challengeId, languageId, sourceCode, stdin })
      .then((r) => r.data),
};
