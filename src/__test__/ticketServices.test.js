const {
    viewTicket,
    viewEmployeeTickets,
    updateStatus,
    addTicket
} = require('../service/ticketService');
const {
    registerUser,
    loginUser,
    getUserByUsername,
    deleteUser
} = require('../service/authService');

describe("Test add a new ticket", () => {
    let loggedInUser;

    beforeAll(async () => {
        const data = {
            name: "testUser2",
            username: "test2",
            password: "test2",
            email: "test2@gmail.com"
        }
        const newUser = await registerUser(data);
        loggedInUser = await loginUser({ username: "test2", password: "test2" });


    });

    afterAll(async () => {
        const user = await getUserByUsername("test2");
        if (user) await deleteUser(user.username);
    });

    beforeEach(async () => {
        loggedInUser = await loginUser({ username: "test2", password: "test2" });
    });

    test("Empty tickets for current user", async () => {
        const user = await getUserByUsername(loggedInUser.data.username);
        const tickets = user.tickets;
        expect(tickets).toEqual([]);
    });

    test("Create a new ticket for current user", async () => {
        const data = {
            amount: 100,
            description: "This is my first ticket"
        }

        const tickets = await addTicket(loggedInUser.data.employee_id, data);
        tickets.ticket.ticket_id = "1";
        tickets.user.employee_id = "1",
            tickets.user.password = "test2",
            tickets.user.join_date = "today";
        const expectResponse = {
            response: true,
            ticket: {
                description: "This is my first ticket",
                price: 100,
                status: "Pending",
                ticket_id: "1",
                index: 0
            },
            user: {
                name: "testUser2",
                username: "test2",
                password: "test2",
                email: "test2@gmail.com",
                employee_id: "1",
                join_date: "today",
                role: "employee",
                tickets: [],
            }
        }
        expect(tickets).toEqual(expectResponse);
    });

    test("Ticket failed for amount less than 0", async () => {
        const data = {
            amount: -1,
            description: "This is my first ticket"
        }

        const tickets = await addTicket(loggedInUser.data.employee_id, data);

        const expectResponse = { response: false, errors: ["amount must be strictly greater than 0"] }
        expect(tickets).toEqual(expectResponse);
    });

    test("Ticket failed for invalid description", async () => {
        const data = {
            amount: 100,
            description: ""
        }

        const tickets = await addTicket(loggedInUser.data.employee_id, data);

        const expectResponse = { response: false, errors: ["description does not meet minimum length of 1"] }
        expect(tickets).toEqual(expectResponse);
    });

    test("Ticket failed for invalid type for amount", async () => {
        const data = {
            amount: "100",
            description: "This is my first ticket"
        }

        const tickets = await addTicket(loggedInUser.data.employee_id, data);

        const expectResponse = { response: false, errors: ["amount is not of a type(s) number"] }
        expect(tickets).toEqual(expectResponse);
    });

    test("Ticket failed for missing data", async () => {
        const data = {

        }

        const tickets = await addTicket(loggedInUser.data.employee_id, data);

        const expectResponse = {
            response: false, errors: ["requires property \"amount\"",
                "requires property \"description\""]
        }
        expect(tickets).toEqual(expectResponse);
    });

    test("User should have one ticket, tickets/<ticket_id>", async () => {
        const tickets = await viewTicket(loggedInUser.data.employee_id, 0);
        tickets.ticket.ticket_id = "1"
        const expectResponse = {
            response: true,
            ticket: {
                description: "This is my first ticket",
                price: 100,
                status: "Pending",
                ticket_id: "1",
            }
        }
        expect(tickets).toEqual(expectResponse);
    });

    test("Invalid ticket id, tickets/<ticket_id>", async () => {
        const tickets = await viewTicket(loggedInUser.data.employee_id, 99999);
        const expectResponse = {
            response: false,
            errors: "No ticket found!"
        }
        expect(tickets).toEqual(expectResponse);
    });

    test("Invalid ticket type, tickets/string", async () => {
        const tickets = await viewTicket(loggedInUser.data.employee_id, "99999");
        const expectResponse = {
            response: false,
            errors: ["ticket_id is not of a type(s) number"]
        }
        expect(tickets).toEqual(expectResponse);
    });

    // test("Admin is able to view all employee's pending tickets, tickets/?status=Pending", async () => {
    //     const tickets = await viewEmployeeTickets(loggedInUser.data.employee_id, "manager", "Pending");

    //     const expectResponse = {
    //         response: true,
    //         ticket: {
    //             description: "This is my first ticket",
    //             price: 100,
    //             status: "Pending",
    //             ticket_id: "1",
    //         }
    //     }
    //     expect(tickets).toEqual(expectResponse);
    // });

    test("User is NOT able to view all employee's pending tickets, tickets/?status=Pending", async () => {
        const tickets = await viewEmployeeTickets(loggedInUser.data.employee_id, "employee", "Pending");

        const expectResponse = {
            response: false,
            errors: ["role does not exactly match expected constant: manager"]
        }
        expect(tickets).toEqual(expectResponse);
    });

    test("Ticket status should only be Pending, tickets/?status=Pending", async () => {
        const tickets = await viewEmployeeTickets(loggedInUser.data.employee_id, "manager", "");

        const expectResponse = {
            response: false,
            errors: ["status does not exactly match expected constant: Pending"]
        }
        expect(tickets).toEqual(expectResponse);
    });

    test("Ticket must have a role and status properties, tickets/?status=Pending", async () => {
        const tickets = await viewEmployeeTickets(loggedInUser.data.employee_id);

        const expectResponse = {
            response: false,
            errors: ["requires property \"role\"", "requires property \"status\"",
            ]
        }
        expect(tickets).toEqual(expectResponse);
    });

    test("Admin is able to update a ticket status (Approved), tickets/<ticket_id>", async () => {
        const data = {
            username: "test2",
            status: "Approved"
        }
        const { response, status } = await updateStatus(0, loggedInUser.data.employee_id, data);

        const expectResponse = {
            response: true,
            status: "Approved",
        }

        expect(response).toEqual(expectResponse.response);
        expect(status).toEqual(expectResponse.status);

    });

    test("Admin is able to update a ticket status (Denied), tickets/<ticket_id>", async () => {

        const tickets = await addTicket(loggedInUser.data.employee_id, {
            amount: 200,
            description: "This is my second ticket"
        });

        const data = {
            username: "test2",
            status: "Denied"
        }
        const { response, status } = await updateStatus(1, loggedInUser.data.employee_id, data);

        const expectResponse = {
            response: true,
            status: "Denied",
        }

        expect(response).toEqual(expectResponse.response);
        expect(status).toEqual(expectResponse.status);

    });

    
    test("Admin is NOT able to update a ticket status that was already processed, tickets/<ticket_id>", async () => {
        const data = {
            username: "test2",
            status: "Approved"
        }
        const ticket = await updateStatus(0, loggedInUser.data.employee_id, data);

        const expectResponse = {
            response: false,
            errors: "Ticket was already processed!",
        }

        expect(ticket).toEqual(expectResponse);

    });

    test("Updating ticket status with invalid username, tickets/<ticket_id>", async () => {
        const data = {
            username: "test3",
            status: "Approved"
        }
        const ticket = await updateStatus(0, loggedInUser.data.employee_id, data);

        const expectResponse = {
            response: false,
            errors: "No user found!",
        }

        expect(ticket).toEqual(expectResponse);

    });

    test("Updating ticket status with invalid status, tickets/<ticket_id>", async () => {
        const data = {
            username: "test2",
            status: "Pending"
        }
        const ticket = await updateStatus(0, loggedInUser.data.employee_id, data);

        const expectResponse = {
            response: false,
            errors: ["status is not one of enum values: Approved,Denied"]
        }

        expect(ticket).toEqual(expectResponse);

    });

    test("Updating ticket status with invalid ticket id, tickets/<ticket_id>", async () => {
        const data = {
            username: "test1",
            status: "Approved"
        }
        const ticket = await updateStatus(99999, loggedInUser.data.employee_id, data);

        const expectResponse = {
            response: false,
            errors: "No ticket found!"
        }

        expect(ticket).toEqual(expectResponse);

    });
});