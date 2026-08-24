import fastify from "fastify";

import init from "../server/plugin.js";

// Сборка стилей проверяется прогоном: её отказ выглядит как успех, потому что
// main.css оказывается на месте, а классов из шаблонов в нём нет, и страница
// приходит без оформления.
describe("assets", () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    await init(app);
  });

  it("отдаёт собранный css с классами из шаблонов", async () => {
    const res = await app.inject({ method: "GET", url: "/assets/main.css" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatch(".max-w-3xl");
    expect(res.body).toMatch(".bg-red-50");
  });
});
