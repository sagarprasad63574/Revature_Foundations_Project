const {
    viewMyTickets,
    addTicket
} = require('../service/ticketService');
const {
    registerUser,
    loginUser,
    getUserByUsername,
    deleteUser
} = require('../service/authService');

describe("Test view user's tickets", () => {
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
        const tickets = await viewMyTickets(loggedInUser.data.employee_id);
        const expectResponse = { response: false, tickets: [] }
        expect(tickets).toEqual(expectResponse);
    });

    test("Create a new ticket for current user", async () => {
        const data = {
            amount: 100,
            description: "This is my first ticket"
        }
    
        const tickets = await addTicket(loggedInUser.data.employee_id, data);
        tickets.ticket.ticket_id = "1";
        const expectResponse = { response: true, ticket: {
            description: "This is my first ticket",
            price: 100,
            status: "pending",
            ticket_id: "1"
        } }
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

        const expectResponse = { response: false, errors: ["requires property \"amount\"", 
                                                            "requires property \"description\""] }
        expect(tickets).toEqual(expectResponse);
    });

});
