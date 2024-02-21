const express = require('express');
const router = express.Router();

const authService = require('../service/authService');

// router.get('/', async (req, res) => {
//     try {
//         const employees = await authService.getAllItem();
//         res.status(200).json(employees);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ err: 'Something went wrong' });
//     }
// });

router.get('/', async (req, res) => {
    const nameQuery = req.query.name;
    try {
        if (nameQuery) {
            const item = await authService.getItem({employee_id: nameQuery});
            res.status(200).json(item);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});

router.post("/register", async function (req, res, next) {
    try {

        const { response, errors } = await authService.postItem(req.body);

        if (response) {
            res.status(201).json({ message: "Created Item" })
        } else {
            res.status(400).json({ errors: errors, receivedData: req.body });
        }

    } catch (err) {
        return next(err);
    }
});


// app.post("/login", async function (req, res, next) {
//     try {
//         const validator = jsonschema.validate(req.body, userAuthSchema);
//         if (!validator.valid) {
//             const errs = validator.errors.map(e => e.stack);
//             throw new Error(errs)
//         }

//         //check if username is in the database. if no user found return an error message otherwise return user

//         const { username, password } = req.body
//         const findUser = await getUser(username);
//         if (!findUser || password !== findUser.password) return res.status(400).json("Username/Password is invalid.");

//         console.log(findUser);

//         const token = createToken({ ...findUser, isAdmin: false });
//         // console.log(token);

//         return res.status(200).json({ token, ...findUser });
//     } catch (err) {
//         return next(err);
//     }
// });

// app.post("/ticket", ensureLoggedIn, async function (req, res, next) {
//     try {
//         const validator = jsonschema.validate(req.body, ticketAddSchema);
//         if (!validator.valid) {
//             const errs = validator.errors.map(e => e.stack);
//             throw new Error(errs);
//         }

//         const ticket = req.body;

//         if (ticket.amount <= 0) return res.status(400).json("Amount must be greater than 0");

//         //send the ticket information(amount, price, and status) to be added to the database associated with a user 
//         //{id: "username", password: "password", position: "position", tickets: <list tickets> }
//         //tickets = [amount: 100, description: "this is $100", status: "Pending(by default)"] //push()

//         const username = res.locals.user.username;

//         const newTicket = await addNewTicket({ ...ticket, status: "Pending", username });
//         console.log(newTicket);

//         // const token = createToken({ ...newUser, isAdmin: false });
//         // console.log(token);

//         return res.status(201).json({});
//     } catch (err) {
//         return next(err);
//     }
// });

module.exports = router;