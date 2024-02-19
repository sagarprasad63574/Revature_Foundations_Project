const express = require('express');
const jsonschema = require('jsonschema');
const userAuthSchema = require('./schemas/userAuth.json');
const userRegisterSchema = require('./schemas/userRegisterSchema.json');
const ticketAddSchema = require('./schemas/ticketAddSchema.json');
const { authenticateJWT, ensureLoggedIn } = require("./middleware/auth");
const { createToken } = require('./helpers/tokens.js');
const { getAllUsers, addUser } = require('./dynamodb.js');

const app = express();
const port = process.env.PORT || 3000;
const usersArr = [];

app.use(express.json());
app.use(authenticateJWT);

app.get('/', ensureLoggedIn, (req, res) => {
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

        //check if username is in the database. if no user found return an error message otherwise return user

        const user = req.body
        const query = usersArr.filter((u) => u.username == user.username && u.password == user.password);

        if (query.length <= 0) {
            console.log("Username/password not found. Try again");
            throw new Error("Invalid username/password");
        };

        const token = createToken({ ...user, isAdmin: false });
        console.log(token);

        return res.json({ token });
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

        //add new user to the database. if username already exists in the database return an error message 
        //overwise add the new user and return the user 
        //{id: "username", password: "password", position: "position"}

        //const newUser = await addUser({ ...req.body, isAdmin: false });


        const newUser = req.body;

        const query = usersArr.filter((user) => user.username == newUser.username);

        if (query.length > 0) {
            console.log("Username not available. Try a different username");
            throw new Error("Try a different username");
        };

        usersArr.push({ ...newUser });
        console.log(usersArr);

        const token = createToken({ ...newUser, isAdmin: false });
        console.log(token);

        return res.status(201).json({ ...newUser });
    } catch (err) {
        return next(err);
    }
});

app.post("/ticket", ensureLoggedIn, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, ticketAddSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new Error(errs);
        }

        const ticket = req.body;

        //send the ticket information(amount, price, and status) to be added to the database associated with a user 
        //{id: "username", password: "password", position: "position", tickets: <list tickets> }
        //tickets = [amount: 100, description: "this is $100", status: "Pending(by default)"] //push()

        const getUser = usersArr.map((user, index) => {
            if (user.username == "john123") {
                console.log(index);
            }
        });

        getUser.tickets = [...getUser.tickets, ticket];

        // if (query.length > 0) {
        //     console.log("Username not available. Try a different username");
        //     throw new Error("Try a different username");
        // };

        // usersArr.push({ ...newUser });
        // console.log(usersArr);

        // const token = createToken({ ...newUser, isAdmin: false });
        // console.log(token);

        return res.status(201).json({ });
    } catch (err) {
        return next(err);
    }
});

app.listen(3000, () => {
    console.log(`Started on http://localhost:${port}`);
});

module.exports = { app }; 