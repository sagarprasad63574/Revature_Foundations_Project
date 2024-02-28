const express = require('express');
const router = express.Router();

const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const ticketService = require('../service/ticketService');

router.get('/', ensureAdmin, async (req, res, next) => {
    const role = res.locals.user.role;
    const status = req.query.status;
    const employee_id = res.locals.user.id;

    try {
        const { response, message, errors, tickets } = await ticketService.viewEmployeeTickets(employee_id, role, status);
        if (response) {
            return res.status(200).json({ message, tickets })
        } else {
            return res.status(400).json({ errors })
        }
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    const employee_id = res.locals.user.id;
    const ticket_id = +req.params.id;

    try {
        const { response, ticket } = await ticketService.viewTicket(employee_id, ticket_id);
        if (response) {
            return res.status(200).json(ticket)
        } else {
            return res.status(400).json({ message: "No tickets found!", ticket_id })
        }
    } catch (err) {
        return next(err);
    }
});

router.post('/', ensureLoggedIn, async (req, res, next) => {
    const employee_id = res.locals.user.id;

    try {
        const { response, errors, ticket, user } = await ticketService.addTicket(employee_id, req.body);

        if (response) {
            return res.status(201).json({
                message: "New ticket created",
                ticket,
                username: user.username,
                employee_id: user.employee_id,
                role: user.role
            })
        } else {
            return res.status(400).json({ message: "Ticket NOT created", errors })
        }
    } catch (err) {
        return next(err);
    }
});

router.put('/:id', ensureAdmin, async (req, res, next) => {
    const ticket_id = +req.params.id;
    const manager_id = res.locals.user.id;

    try {
        const {
            response,
            errors,
            user,
            ticket,
            status,
            manager
        } = await ticketService.updateStatus(ticket_id, manager_id, req.body);
        if (response) {
            return res.status(202).json({
                message: "Ticket status updated",
                username: user.username,
                employee_id: user.employee_id,
                ticket_id: ticket_id,
                amount: ticket.amount,
                description: ticket.description,
                status: status,
                manager_id: manager
            });
        } else {
            return res.status(400).json({ errors: errors, ticket_id })
        }
    } catch (err) {
        return next(err);
    }
});

module.exports = router; 