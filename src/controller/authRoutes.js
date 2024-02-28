const express = require('express');
const router = express.Router();

const authService = require('../service/authService');
const { createToken } = require('../util/tokens');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');

router.get('/', ensureLoggedIn, async (req, res) => {
    const currentUser = res.locals.user.username;
    const username = req.query.username;
    try {
        const validUser = await authService.validCurrentUser(currentUser, username);
        if (!validUser) return res.status(403).json({ message: "Access denied!" });

        const user = await authService.getUserByUsername(username);
        if (user) {
            return res.status(200).json({
                user: {
                    name: user.name,
                    username: user.username,
                    employee_id: user.employee_id,
                    join_date: user.join_date,
                    email: user.email,
                    role: user.role
                },
                tickets: user.tickets
            })
        } else {
            return res.status(404).json({ message: "username not found" })
        }
    } catch (err) {
        return next(err);
    }
});

router.post("/register", async function (req, res, next) {
    try {
        const { response, errors } = await authService.registerUser(req.body);
        if (response) {
            return res.status(201).json({ message: "New User Registered" })
        } else {
            return res.status(400).json({ errors: errors, data: req.body });
        }
    } catch (err) {
        return next(err);
    }
});

router.post("/login", async function (req, res, next) {
    try {
        const { response, errors, data } = await authService.loginUser(req.body);
        if (response) {
            const token = createToken(data);
            return res.status(200).json({ message: "User loggedIn", token, role: data.role })
        }
        return res.status(400).json({ errors: errors, data: req.body });
    } catch (err) {
        return next(err);
    }
});

router.delete("/delete/:username", ensureAdmin, async function (req, res, next) {
    const username = req.params.username
    try {
        const { response, message } = await authService.deleteUser(username);
        if (response) {
            return res.status(200).json({ message })
        }
        return res.status(401).json({ message });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;