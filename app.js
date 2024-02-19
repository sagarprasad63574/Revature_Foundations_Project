const express = require('express');
const jsonschema = require('jsonschema');
const userAuthSchema = require('./schemas/userAuth.json');
const userRegisterSchema = require('./schemas/userRegisterSchema.json');
const ticketAddSchema = require('./schemas/ticketAddSchema.json');
const { authenticateJWT, ensureLoggedIn } = require("./middleware/auth");
const { createToken } = require('./helpers/tokens.js');
const { getTicketsFromUser, getUser, addNewUser, addNewTicket } = require('./dynamodb.js');

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
        const users = await getTicketsFromUser();
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

        const { username, password } = req.body
        const findUser = await getUser(username);
        if (!findUser || password !== findUser.password) return res.status(400).json("Username/Password is invalid.");

        console.log(findUser);

        const token = createToken({ ...findUser, isAdmin: false });
        // console.log(token);

        return res.status(200).json({token, ...findUser});
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

        const newUser = req.body;

        //Check if username is already in the database. If so return reponse 400 and Message: Username already in use.
        const getUsername = await getUser(newUser.username);
        if (getUsername) return res.status(400).json("Username already in use. Try again");

        //Create a new user and add to database and return response 201 and message of user object that was created.
        const createdNewUser = await addNewUser({...newUser, isAdmin : false});
        const returnUser = await getUser(newUser.username);

        // const token = createToken({ ...newUser, isAdmin: false });
        // console.log(token);

        return res.status(201).json({ message: "Created new user", username: returnUser.username });
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

        if (ticket.amount <= 0) return res.status(400).json("Amount must be greater than 0"); 

        //send the ticket information(amount, price, and status) to be added to the database associated with a user 
        //{id: "username", password: "password", position: "position", tickets: <list tickets> }
        //tickets = [amount: 100, description: "this is $100", status: "Pending(by default)"] //push()
        
        const username = res.locals.user.username;

        const newTicket = await addNewTicket({...ticket, status: "Pending", username});
        console.log(newTicket);

        // const token = createToken({ ...newUser, isAdmin: false });
        // console.log(token);

        return res.status(201).json({});
    } catch (err) {
        return next(err);
    }
});

app.listen(3000, () => {
    console.log(`Started on http://localhost:${port}`);
});

module.exports = { app }; 