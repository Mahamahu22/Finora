const request = require("supertest");
const app = require("../src/app");

let token;

beforeAll(async () => {
  const reg = await request(app).post("/api/auth/register").send({
    name: "Ex",
    email: "ex@example.com",
    password: "secret12"
  });
  token = reg.body.token;
});

test("create + list expenses", async () => {
  const create = await request(app)
    .post("/api/expenses")
    .set("Authorization", `Bearer ${token}`)
    .send({ amount: 1200, category: "Food", note: "Lunch" });

  expect(create.status).toBe(201);
  expect(create.body.amount).toBe(1200);

  const list = await request(app)
    .get("/api/expenses")
    .set("Authorization", `Bearer ${token}`);

  expect(list.status).toBe(200);
  expect(list.body.items.length).toBeGreaterThan(0);
});
