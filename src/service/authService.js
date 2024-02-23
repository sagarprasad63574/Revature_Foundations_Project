const userDAO = require('../repository/userDAO');
const uuid = require('uuid');
const jsonschema = require('jsonschema');
const userAuthSchema = require('../schemas/userAuth.json');
const userRegisterSchema = require('../schemas/userRegisterSchema.json');
const logger = require('../util/logger');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config')

const getAllItem = async () => {
    const items = await userDAO.getAllItems();
    return items;
}

const registerUser = async (receivedData) => {
    let employee_id = uuid.v4();
    let join_date = Math.floor(new Date().getTime() / 1000);
    let role = receivedData.role || "employee"
    let tickets = []

    let { response, errors } = validateRegister(receivedData);
    if (!response) return { response: false, errors: errors }

    let duplicatedUser = await getUserByUsername(receivedData.username);
    if (duplicatedUser) return { response: false, errors: "Duplicated username" }

    let hashedPassword = await bcrypt.hash(receivedData.password, BCRYPT_WORK_FACTOR);

    let data = await userDAO.createUser({
        employee_id: employee_id,
        join_date: join_date,
        name: receivedData.name,
        username: receivedData.username,
        password: hashedPassword,
        email: receivedData.email,
        role: role,
        tickets: tickets
    });
    return { response: true, message: "user created" };

}

function validateRegister(receivedData) {
    const validator = jsonschema.validate(receivedData, userRegisterSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack.substring(9));
        logger.error(errs);
        return { response: false, errors: errs };
    }
    return { response: true };
}

const loginUser = async (receivedData) => {
    let { response, errors } = validateLogin(receivedData);
    if (!response) return { response: false, errors: errors };

    const user = await getUserByUsername(receivedData.username);
    if (!user) return { response: false, errors: "No user found!" }

    const isValidPassword = await bcrypt.compare(receivedData.password, user.password);
    if (!isValidPassword) return { response: false, errors: "Incorrect password." }

    return {
        response: true,
        data: {
            employee_id: user.employee_id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            tickets: user.tickets
        }
    }
}

function validateLogin(receivedData) {
    const validator = jsonschema.validate(receivedData, userAuthSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack.substring(9));
        logger.error(errs);
        return { response: false, errors: errs };
    }

    return { response: true }

}

const getUserByUsername = async (username) => {
    const data = await userDAO.getUserByUsername(username);
    return (data) ? data : null;
}

const getUserById = async (employee_id) => {
    const data = await userDAO.getUserById(employee_id);
    return (data) ? data : null;
}

const deleteUser = async (username) => {
    const user = await getUserByUsername(username);
    if (user) {
        const data = await userDAO.deleteUser(user.employee_id);
        return { response: true, message: "User deleted!" };
    }

    return { response: false, message: "No username found!" }
}
module.exports = {
    getAllItem,
    getUserByUsername,
    getUserById,
    registerUser,
    loginUser,
    deleteUser
}