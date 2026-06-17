const { Router } = require("express");
const clubsController = require("../controllers/clubs.controller");

const clubsRouter = Router();

clubsRouter.get("/clubs", clubsController.getClubs);
clubsRouter.post("/clubs", clubsController.getClubsByIds);
clubsRouter.get("/clubs/:clubId/users", clubsController.getClubUsers);

module.exports = clubsRouter;
