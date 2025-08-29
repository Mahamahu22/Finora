const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
require("dotenv").config();
const connect = require("../src/config/db");

let token;

beforeAll(async () => {
  process.env.MONGO_URI = process.env.MONGO_URI.replace(/(\w+)$/, "$1_test");
  await connect();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

test("register -> login", async () => {
  const reg = await request(app).post("/api/auth/register").send({
    name: "Tester",
    email: "tester@example.com",
    password: "secret12"
  });
  expect(reg.status).toBe(201);
  expect(reg.body.user.email).toBe("tester@example.com");

  const login = await request(app).post("/api/auth/login").send({
    email: "tester@example.com",
    password: "secret12"
  });
  expect(login.status).toBe(200);
  token = login.body.token;
  expect(token).toBeTruthy();
});

test("get profile (auth)", async () => {
  const res = await request(app).get("/api/user/profile").set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(res.body.email).toBe("tester@example.com");
});
