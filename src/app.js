const express = require('express');
const { authenticateJWT, ensureLoggedIn } = require("./middleware/auth");
const { createToken } = require('./helpers/tokens.js');
const { PORT } = require('./config.js')
const authRoutes = require('./controller/authRoutes.js');
const logger = require('./util/logger');

const app = express();

app.use(express.json());
app.use(authenticateJWT);
app.use((req, res, next) => {
    logger.info(`Incoming ${req.method}: ${req.url}`);
    next();
})

app.use('/auth', authRoutes)


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(PORT, () => {
    console.log(`Started on http://localhost:${PORT}`);
});

module.exports = { app }; 