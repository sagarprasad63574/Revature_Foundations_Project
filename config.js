require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-key";

module.exports = { SECRET_KEY };