import express from 'express'; 
import jsonschema from 'jsonschema';
import jwt from 'jsonwebtoken';
import userAuthSchema from './schemas/userAuth.json' with { type: "json" };
import userRegisterSchema from './schemas/userRegisterSchema.json' with { type: "json" };

const app = express(); 
app.use(express.json());

const SECRET_KEY = "SECRET";

app.post("/login", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new Error(errs)
        }

        const { username, password } = req.body; 
        //check if user is in the database
        let user = {"username": username, "password": password};
        const token = createToken(user)
        return res.json({ username, token });
    } catch(err) {
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
        //const newUser = await User.register({ ...req.body, isAdmin: false });
        const { username, firstName, lastName, password, email } = req.body; 

        let newUser = {"username": username, "password": password};

        const token = createToken(newUser);
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});

function createToken(user) {
    let payload = {
        username: user.username,
    };

    return jwt.sign(payload, SECRET_KEY);
}

app.listen(3000, () => {
    console.log(`Started on http://localhost:3000`);
});

export default app; 