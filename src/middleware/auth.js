const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }
        return next();

    } catch (err) {
        next(err);
    }
}


function ensureLoggedIn(req, res, next) {
    try {
        if (!res.locals.user) throw new Error("User not logged In");
        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = { authenticateJWT, ensureLoggedIn };