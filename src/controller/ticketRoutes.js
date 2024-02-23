const express = require('express');
const router = express.Router();
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const ticketService = require('../service/ticketService');

router.get('/', ensureLoggedIn, async (req, res, next) => {
    const employee_id = res.locals.user.id;

    try {
        const { response, tickets } = await ticketService.viewMyTickets(employee_id);
        if (response) {
            return res.status(200).json({ tickets })
        } else {
            return res.status(400).json({ message: "No tickets found!", tickets })
        }
    } catch (err) {
        return next(err);
    }
});

router.post('/', ensureLoggedIn, async (req, res, next) => {
    const employee_id = res.locals.user.id;

    try {
        const { response, errors, ticket } = await ticketService.addTicket(employee_id, req.body);
        if (response) {
            return res.status(201).json({ message: "New ticket created", ticket })
        } else {
            return res.status(400).json({ message: "Ticket NOT created", errors })
        }
    } catch (err) {
        return next(err);
    }
});

router.put('/:id', ensureAdmin, async (req, res, next) => {
    const ticket_id = +req.params.id;
    const employee_id = res.locals.user.id;

    try {
        const { response, errors, user, ticketStatus } = await ticketService.updateStatus(ticket_id, req.body);
        if (response) {
            return res.status(202).json({
                message: "Ticket status updated",
                manager: employee_id,
                user: user.username,
                id: user.employee_id,
                ticket_id: ticket_id,
                status: ticketStatus.status
            });
        } else {
            return res.status(400).json({ errors: errors, ticket_id })
        }
    } catch (err) {
        return next(err);
    }
});


module.exports = router; 