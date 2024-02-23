const jsonschema = require('jsonschema');
const uuid = require('uuid');
const ticketDAO = require('../repository/ticketDAO');
const { getUserByUsername } = require('./authService');
const ticketRegisterSchema = require('../schemas/ticketAddSchema.json');
const ticketStatusSchema = require('../schemas/ticketStatusSchema.json');
const logger = require('../util/logger');

const viewMyTickets = async (employee_id) => {

    const tickets = await ticketDAO.viewTickets(employee_id);

    if (tickets.length) {
        return { response: true, tickets };
    }

    return { response: false, tickets }
}

const addTicket = async (employee_id, receivedData) => {

    let { response, errors } = validateTicket(receivedData);
    if (!response) return { response: false, errors: errors }

    const ticket_id = uuid.v4();
    const status = "pending";

    let data = await ticketDAO.createTicket(employee_id,
        {
            ticket_id,
            status,
            amount: receivedData.amount,
            description: receivedData.description
        });

    if (data) {
        let ticket = data[data.length - 1];
        return { response: true, ticket };
    }

    return { response: false };

}

function validateTicket(receivedData) {
    const validator = jsonschema.validate(receivedData, ticketRegisterSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack.substring(9));
        logger.error(errs);
        return { response: false, errors: errs };
    }
    return { response: true };
}

const updateStatus = async (ticket_id, receivedDatadata) => {

    let { response, errors } = validateStatus({ ticket_id, ...receivedDatadata });
    if (!response) return { response: false, errors: errors }

    const user = await getUserByUsername(receivedDatadata.username);

    if (!user) return { response: false, errors: "No user found!" }
    if (!user.tickets.length || ticket_id >= user.tickets.length) return { response: false, errors: "No ticket found!" }

    let ticketStatus = await ticketDAO.changeStatus(user.employee_id, ticket_id, receivedDatadata.status);

    if (ticketStatus) {
        return { response: true, user, ticketStatus };
    }

    return { response: false };

}

function validateStatus(ticket) {
    const validator = jsonschema.validate(ticket, ticketStatusSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack.substring(9));
        logger.error(errs);
        return { response: false, errors: errs };
    }
    return { response: true };
}


module.exports = {
    viewMyTickets,
    addTicket,
    updateStatus
}