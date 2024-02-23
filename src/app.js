const express = require('express');
const { authenticateJWT } = require("./middleware/auth");
const { PORT } = require('./config.js')
const authRoutes = require('./controller/authRoutes.js');
const ticketRoutes = require('./controller/ticketRoutes.js');
const logger = require('./util/logger');

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(authenticateJWT);
app.use((req, res, next) => {
    logger.info(`Incoming ${req.method}: ${req.url}`);
    next();
})
app.use('/auth', authRoutes)
app.use('/tickets', ticketRoutes);
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

app.listen(PORT, () => {
    console.log(`Started on http://localhost:${PORT}`);
});

module.exports = { app }; 