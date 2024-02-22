const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand
} = require('@aws-sdk/lib-dynamodb');
const logger = require('../util/logger')

require('dotenv').config();

const dynamoDBClient = new DynamoDBClient({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
const TableName = "FOUNDATIONS_PROJECT";

const getAllItems = async () => {
    const command = new ScanCommand({
        TableName,
    });

    try {
        const data = await documentClient.send(command);
        return data.Items;
    } catch (error) {
        logger.error(error);
    }
}

const getItem = async (key) => {
    const command = new GetCommand({
        TableName,
        Key: key
    });

    try {
        const data = await documentClient.send(command);
        return data.Item;
    } catch (error) {
        logger.error(error);
    }
}

const createEmployee = async (item) => {
    //name, username, password, email, role=employee, employee_id, join_date, tickets = []

    const command = new PutCommand({
        TableName,
        Item: item
    });

    try {
        const data = await documentClient.send(command);
        return data;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const getUserByUsername = async (username) => {
    const command = new QueryCommand({
        TableName,
        IndexName: "username-index",
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: { ":username" : username}
    });

    try {
        const data = await documentClient.send(command);
        return data.Items[0];
    } catch (error) {
        logger.error(error);
        return null;
    }
};

// const addNewUser = async (user) => {
//     const command = new PutCommand({
//         TableName: TABLE_NAME,
//         Item: {
//             username: user.username,
//             password: user.password,
//             isAdmin: user.isAdmin
//         },
//     });

//     const response = await documentClient.send(command);
//     console.log(response);
//     return response;
// };

// const addNewTicket = async ({ username, amount, description, status }) => {
//     const command = new PutCommand({
//         TableName: TABLE_NAME,
//         Item: {
//             username,
//             amount,
//             description,
//             status
//         },
//     });

//     const response = await documentClient.send(command);
//     console.log(response);
//     return response;
// };

// const getUser = async (id) => {
//     const params = {
//         TableName: TABLE_NAME,
//         Key: marshall({ id: id })
//     };

//     let users;
//     try {
//         users = await dynamoDBClient.send(new GetItemCommand(params));
//         console.log(unmarshall(users.Item));
//     }
//     catch (err) {
//         console.log(err);
//     }
//     return users;
// }


// const addUser = async (user) => {
//     //console.log(getUser("1"));

//     const params = {
//         TableName: TABLE_NAME,
//         Key: marshall({ id: user.id }),
//         UpdateExpression: `SET username = ${user.username}`,
//         ReturnValues: "ALL_NEW",
//     };

//     let newUser;
//     try {
//         newUser = await dynamoDBClient.send(new UpdateItemCommand(params));
//         console.log(newUser);
//     }
//     catch (err) {
//         console.log(err);
//     }
//     return newUser;
// }

module.exports = {
    getAllItems,
    getItem,
    getUserByUsername,
    createEmployee
}