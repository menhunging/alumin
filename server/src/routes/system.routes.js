const { Router } = require("express");

const systemRouter = Router();

systemRouter.get("/test", (_req, res) => {
  res.status(200).json({ ok: true, service: "alumin-server" });
});

systemRouter.get("/", (_req, res) => {
  res.send("Express server is running");
});

module.exports = systemRouter;
