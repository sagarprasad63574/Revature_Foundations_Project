const DAO = require('../repository/DAO');
const uuid = require('uuid');
const jsonschema = require('jsonschema');
const userAuthSchema = require('../schemas/userAuth.json');
const userRegisterSchema = require('../schemas/userRegisterSchema.json');
const ticketAddSchema = require('../schemas/ticketAddSchema.json');
const logger = require('../util/logger')

const getAllItem = async () => {
    const items = await DAO.getAllItems();
    return items;
}

const registerEmployee = async (receivedData) => {
    let employee_id = uuid.v4();
    let join_date = Math.floor(new Date().getTime() / 1000);
    let role = receivedData.role || "employee"
    let tickets = []

    let { response, errors } = validateRegister(receivedData);
    if (!response) return { response: false, errors: errors }

    let duplicatedUser = await getUserByUsername(receivedData.username);
    if (duplicatedUser) return { reponse: false, errors: "Duplicated username" }

    let data = await DAO.createEmployee({
        employee_id: employee_id,
        join_date: join_date,
        name: receivedData.name,
        username: receivedData.username,
        password: receivedData.password,
        email: receivedData.email,
        role: role,
        tickets: tickets
    });
    return { response: true, data: data };

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

const loginEmployee = async (receivedData) => {
    let { response, errors } = validateLogin(receivedData);
    if (!response) return { response: false, errors: errors };

    const employee = await getUserByUsername(receivedData.username);
    if (!employee) return { response: false, errors: "No user found!" }

    if (employee.password !== receivedData.password) return { response: false, errors: "Incorrect password." }

    return { response: true, data: employee }
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

const getItem = async (key) => {
    const item = await DAO.getItem(key);
    return item;
}

const getUserByUsername = async (username) => {
    const data = await DAO.getUserByUsername(username);
    return (data) ? data : null;
}

module.exports = {
    getAllItem,
    getItem,
    getUserByUsername,
    registerEmployee,
    loginEmployee
}