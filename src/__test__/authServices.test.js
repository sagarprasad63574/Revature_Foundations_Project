const {
    getUserByUsername,
    registerUser,
    loginUser,
    deleteUser } = require('../service/authService.js');

describe("Test registering a user", () => {
    beforeAll(async () => {
        const user = await getUserByUsername("test1");
        if (user) await deleteUser(user.username);
    });

    test("Register a new user", async () => {
        const data = {
            name: "testUser1",
            username: "test1",
            password: "test1",
            email: "test1@gmail.com"
        }
        const newUser = await registerUser(data);
        const expectResponse = { response: true, message: "user created" }
        expect(newUser).toEqual(expectResponse);
    });

    test("User with invalid username", async () => {
        const data = {
            name: "testUser1",
            username: "t",
            password: "test1",
            email: "test1@gmail.com"
        }
        const newUser = await registerUser(data);
        const expectResponse = { response: false, errors: ["username does not meet minimum length of 5"] };
        expect(newUser).toEqual(expectResponse);
    });

    test("User with invalid password", async () => {
        const data = {
            name: "testUser1",
            username: "test1",
            password: "t",
            email: "test1@gmail.com"
        }
        const newUser = await registerUser(data);
        const expectResponse = { response: false, errors: ["password does not meet minimum length of 5"] };
        expect(newUser).toEqual(expectResponse);
    });

    test("User with invalid email", async () => {
        const data = {
            name: "testUser1",
            username: "test1",
            password: "test1",
            email: "test1"
        }
        const newUser = await registerUser(data);
        const expectResponse = { response: false, errors: ["email does not conform to the \"email\" format"] };
        expect(newUser).toEqual(expectResponse);
    });

    test("User with missing fields", async () => {
        const data = {
            name: "testUser1",
            password: "test1",
            email: "test1@gmail.com"
        }
        const newUser = await registerUser(data);
        const expectResponse = { response: false, errors: ["requires property \"username\""] };
        expect(newUser).toEqual(expectResponse);
    });

    test("User with duplicated username", async () => {
        const data = {
            name: "testUser1",
            username: "test1",
            password: "test1",
            email: "test1@gmail.com"
        }
        const newUser = await registerUser(data);
        const expectResponse = { response: false, errors: "Duplicated username" };
        expect(newUser).toEqual(expectResponse);
    });
});

describe("Test logging in a user", () => {

    test("User with valid credentials", async () => {
        const data = {
            username: "test1",
            password: "test1"
        }
        const user = await loginUser(data);
        user.data.employee_id = "1";
        const expectResponse = {
            response: true, data: {
                employee_id: "1",
                name: "testUser1",
                username: "test1",
                email: "test1@gmail.com",
                role: "employee",
                tickets: [],
            }
        };

        expect(user).toEqual(expectResponse);
    });

    test("User with wrong password", async () => {
        const data = {
            username: "test1",
            password: "test2"
        }
        const newUser = await loginUser(data);
        const expectResponse = { response: false, errors: "Incorrect password." };
        expect(newUser).toEqual(expectResponse);
    });
    
    test("User with invalid username", async () => {
        const data = {
            username: "t",
            password: "test1"
        }
        const newUser = await loginUser(data);
        const expectResponse = { response: false, errors: ["username does not meet minimum length of 5"] };
        expect(newUser).toEqual(expectResponse);
    });

    test("User with invalid password", async () => {
        const data = {
            username: "test1",
            password: "t"
        }
        const newUser = await loginUser(data);
        const expectResponse = { response: false, errors: ["password does not meet minimum length of 5"] };
        expect(newUser).toEqual(expectResponse);
    });

    test("User not found with username", async () => {
        const data = {
            username: "test9999999",
            password: "test1"
        }
        const newUser = await loginUser(data);
        const expectResponse = { response: false, errors: "No user found!" };
        expect(newUser).toEqual(expectResponse);
    });

});