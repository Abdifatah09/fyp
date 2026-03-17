const request = require("supertest");
const app = require("../app");

describe("GET /health", () => {
  it("should return API running message", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "API is running" });
  });
});