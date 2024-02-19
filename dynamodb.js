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

const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
require('dotenv').config();

const dynamoDBClient = new DynamoDBClient({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const TABLE_NAME = "users";

const getAllUsers = async () => {
    const params = {
        TableName: TABLE_NAME,
    };

    let allUsers;
    try {
        users = await dynamoDBClient.send(new ScanCommand(params));
        allUsers = users.Items.map((user) => {
            return unmarshall(user);
        });
        console.log({ users: allUsers });
    }
    catch (err) {
        console.log(err);
    }
    return allUsers;
}

const getUser = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: marshall({ id: id })
    };

    let users;
    try {
        users = await dynamoDBClient.send(new GetItemCommand(params));
        console.log(unmarshall(users.Item));
    }
    catch (err) {
        console.log(err);
    }
    return users;
}


const addUser = async (user) => {
    //console.log(getUser("1"));

    const params = {
        TableName: TABLE_NAME,
        Key: marshall({id: user.id}),
        UpdateExpression: `SET username = ${user.username}`,
        ReturnValues: "ALL_NEW",
    };

    let newUser;
    try {
        newUser = await dynamoDBClient.send(new UpdateItemCommand(params));
        console.log(newUser);
    }
    catch (err) {
        console.log(err);
    }
    return newUser;
}

module.exports = { getAllUsers, getUser, addUser }