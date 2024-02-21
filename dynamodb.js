// const AWS = require('aws-sdk');

// const { DynamoDBDocument, } = require('@aws-sdk/lib-dynamodb');

// const { DynamoDB, } = require('@aws-sdk/client-dynamodb');

//require('dotenv').config();

// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
// AWS.config.update({
//     region: process.env.AWS_DEFAULT_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });


// const dynamoClient = DynamoDBDocument.from(new DynamoDB());
// const TABLE_NAME = "users";

// const getUsers = async () => {
//     const params = {
//         TableName: TABLE_NAME,
//     };
//     const users = await dynamoClient.scan(params);
//     return users;
// }

// const addUser = async (user) => {
//     const params = {
//         TableName: TABLE_NAME,
//         Item: user
//     };
//     return await dynamoClient.put(params);
// }

// module.exports = { getUsers, addUser }

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { DynamoDBDocumentClient, GetCommand, BatchGetCommand, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const dynamoDBClient = new DynamoDBClient({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const TABLE_NAME = "foundations_project";
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

const getTicketsFromUser = async (username) => {

    const command = new BatchGetCommand({
        // Each key in this object is the name of a table. This example refers
        // to a Books table.
        RequestItems: {
            tickets: {
                // Each entry in Keys is an object that specifies a primary key.
                Keys: [
                    {
                        username: username,
                    }
                ],
                // Only return the "Title" and "PageCount" attributes.
                ProjectionExpression: "username, tickets",
            },
        },
    });

    const response = await documentClient.send(command);
    console.log(response.Responses["tickets"]);
    return response;
}

const getUser = async (username) => {
    const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
            username: username,
        },
    });

    const response = await documentClient.send(command);
    console.log(response);
    return (response.Item) ? response.Item : null;
};

const addNewUser = async (user) => {
    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            username: user.username,
            password: user.password,
            isAdmin : user.isAdmin
        },
    });

    const response = await documentClient.send(command);
    console.log(response);
    return response;
};

const addNewTicket = async ({username, amount, description, status}) => {
    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            username,
            amount,
            description,
            status
        },
    });

    const response = await documentClient.send(command);
    console.log(response);
    return response;
};

const addNewTicketv2 = async ({username, amount, description, status}) => {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        username: username,
      },
      UpdateExpression: "set tickets = :tickets",
      ExpressionAttributeValues: {
        ":tickets": [amount, description, status],
      },
      ReturnValues: "ALL_NEW",
    });
  
    const response = await documentClient.send(command);
    console.log(response);
    return response;
  };

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

module.exports = { getTicketsFromUser, getUser, addNewUser, addNewTicket }