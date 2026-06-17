const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth.routes");
const clubsRouter = require("./routes/clubs.routes");
const systemRouter = require("./routes/system.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(systemRouter);
app.use(authRouter);
app.use(clubsRouter);

module.exports = app;
