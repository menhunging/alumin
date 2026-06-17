require("dotenv").config();

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 4000;

module.exports = {
  HOST,
  PORT,
};
