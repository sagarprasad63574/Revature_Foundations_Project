require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-key";
const PORT = +process.env.PORT || 3000;
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = { SECRET_KEY, PORT, BCRYPT_WORK_FACTOR };