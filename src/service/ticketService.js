const jsonschema = require('jsonschema');
const uuid = require('uuid');
const ticketDAO = require('../repository/ticketDAO');
const { getUserByUsername, getUserById } = require('./authService');
const ticketViewSchema = require('../schemas/ticketViewSchema.json');
const ticketRegisterSchema = require('../schemas/ticketAddSchema.json');
const ticketStatusSchema = require('../schemas/ticketStatusSchema.json');
const roleSchema = require('../schemas/roleSchema.json');
const logger = require('../util/logger');

// const viewMyTickets = async (employee_id) => {

//     const tickets = await ticketDAO.viewTickets(employee_id);

//     if (tickets.length) {
//         return { response: true, tickets };
//     }

//     return { response: false, tickets }
// }

const viewTicket = async (employee_id, ticket_id) => {
    let { response, errors } = validateViewTicket({ ticket_id });
    if (!response) return { response: false, errors: errors }

    const tickets = await ticketDAO.viewTickets(employee_id);

    if (!tickets.length || ticket_id >= tickets.length) return { response: false, errors: "No ticket found!" }

    const ticket = tickets[ticket_id];

    return { response: true, ticket }
}

function validateViewTicket(receivedData) {
    const validator = jsonschema.validate(receivedData, ticketViewSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack.substring(9));
        logger.error(errs);
        return { response: false, errors: errs };
    }
    return { response: true };
}

const viewEmployeeTickets = async (employee_id, role, status) => {
    let { response, errors } = validateRole({ role, status });
    if (!response) return { response: false, errors: errors }

    const employees = await ticketDAO.allEmployeeTickets("employee");
    const tickets = getAllTickets(employee_id, employees);

    if (tickets.length) return { response: true, message: "Pending tickets",  tickets };
    return { response: false, message: "No tickets found!"}
}

function validateRole(receivedData) {
    const validator = jsonschema.validate(receivedData, roleSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack.substring(9));
        logger.error(errs);
        return { response: false, errors: errs };
    }
    return { response: true };
}

function getAllTickets(employee_id, employees) {
    let tickets = []
    employees.forEach((employee) => {
        if (employee.tickets.length) {
            employee.tickets.forEach((ticket, index) => {
                if (ticket.status === "Pending") {
                    tickets.push({
                        ...ticket,
                        manager: employee_id,
                        username: employee.username,
                        ticket_id: index
                    })
                }
            })
        }
    });

    return tickets;
}

const addTicket = async (employee_id, receivedData) => {

    let { response, errors } = validateTicket(receivedData);
    if (!response) return { response: false, errors: errors }

    const ticket_id = uuid.v4();
    const status = "Pending";

    const user = await getUserById(employee_id);

    let data = await ticketDAO.createTicket(employee_id,
        {
            ticket_id,
            status,
            amount: receivedData.amount,
            description: receivedData.description
        });

    if (data) {
        let index = data.length-1; 
        let ticket = data[index];
        if (index >= 0) ticket.index = index;

        return { response: true, ticket, user };
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

const updateStatus = async (ticket_id, manager_id, receivedDatadata) => {

    let { response, errors } = validateStatus({ ticket_id, ...receivedDatadata });
    if (!response) return { response: false, errors: errors }

    const user = await getUserByUsername(receivedDatadata.username);

    if (!user) return { response: false, errors: "No user found!" }
    if (!user.tickets.length || ticket_id >= user.tickets.length) return { response: false, errors: "No ticket found!" }

    const isStatusChanged = statusChanged(user.tickets, ticket_id, receivedDatadata.status);

    if (!isStatusChanged) return { response: false, errors: "Ticket was already processed!" }

    let ticketStatus = await ticketDAO.changeStatus(user.employee_id, ticket_id, receivedDatadata.status, manager_id);
    
    if (ticketStatus) {
        const ticket = user.tickets[ticket_id];
        return { response: true, user, ticket, status: ticketStatus.status, manager: ticketStatus.manager_id};
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

function statusChanged(tickets, ticket_id) {
    if (tickets[ticket_id].status !== "Pending") return false;
    return true;
}

module.exports = {
    viewTicket,
    viewEmployeeTickets,
    addTicket,
    updateStatus
}