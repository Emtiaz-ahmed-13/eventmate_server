import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app";

describe("Express app", () => {
  it("responds on the health route", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      Message: "Backend is running successfully 🏃🏻‍♂️‍➡️",
    });
  });

  it("returns a structured 404 response for unknown routes", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: "API NOT FOUND!",
      error: {
        path: "/unknown-route",
      },
    });
  });

  it("mounts API routes under /api/v1", async () => {
    const response = await request(app).get("/api/v1/not-found");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
