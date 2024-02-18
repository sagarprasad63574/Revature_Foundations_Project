const express = require('express');
const jsonschema = require('jsonschema');
const userAuthSchema = require('./schemas/userAuth.json');
const userRegisterSchema = require('./schemas/userRegisterSchema.json');
const { createToken } = require('./helpers/tokens.js');
const {getAllUsers, addUser} = require('./dynamodb.js');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const SECRET_KEY = "SECRET";

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});

app.post("/login", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new Error(errs)
        }

        const { username, password } = req.body;
        //check if user is in the database
        let user = { "username": username, "password": password };
        const token = createToken(user)
        return res.json({ username, token });
    } catch (err) {
        return next(err);
    }
});

app.post("/register", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new Error(errs);
        }

        const newUser = await addUser({ ...req.body, isAdmin: false });
        // const token = createToken(newUser);
        // console.log(token);

        return res.status(201).json(newUser);
    } catch (err) {
        return next(err);
    }
});

app.listen(3000, () => {
    console.log(`Started on http://localhost:${port}`);
});

module.exports = {app}; 