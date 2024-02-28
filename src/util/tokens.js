const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

function createToken(user) {
    let payload = {
        id: user.employee_id,
        username: user.username,
        role: user.role
    }

    return jwt.sign(payload, SECRET_KEY, { expiresIn: "60m" });
}

module.exports = { createToken } 
