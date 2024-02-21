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

const postItem = async (receivedData) => {
    let employee_id = uuid.v4();
    let join_date = Math.floor(new Date().getTime() / 1000);
    let role = receivedData.role || "employee"
    let tickets = []

    let {response, errors} = validateItem(receivedData);
    console.log(response);

    if (response) {
        let data = await DAO.createItem({
            employee_id: employee_id,
            join_date: join_date,
            name: receivedData.name,
            username: receivedData.username,
            pasword: receivedData.password,
            email: receivedData.email,
            role: role,
            tickets: tickets
        });
        return {response: true};
    }

    return {response: false, errors: errors};
}

function validateItem(receivedData) {
    const validator = jsonschema.validate(receivedData, userRegisterSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack.substring(9));
        logger.error(errs);
        return {response: false, errors: errs}; 
    }
    return {response: true};
}

const getItem = async (key) => {
    const item = await DAO.getItem(key);
    return item;
}


module.exports = {
    getAllItem,
    getItem,
    postItem
}