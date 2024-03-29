const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    DeleteCommand,
    QueryCommand,
} = require('@aws-sdk/lib-dynamodb');
const logger = require('../util/logger');

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

const createUser = async (item) => {
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
        ExpressionAttributeValues: { ":username": username }
    });

    try {
        const data = await documentClient.send(command);
        return data.Items[0];
    } catch (error) {
        logger.error(error);
        return null;
    }
};

const getUserById = async (employee_id) => {
    const command = new GetCommand({
        TableName,
        Key: {
            employee_id
        }
    });

    try {
        const data = await documentClient.send(command);
        return data.Item;
    } catch (error) {
        logger.error(error);
        return null;
    }
};

const deleteUser = async (employee_id) => {
    const command = new DeleteCommand({
        TableName,
        Key: {
            employee_id: employee_id
        },
    });

    const response = await documentClient.send(command);
    return response;
}

module.exports = {
    getUserByUsername,
    getUserById,
    createUser,
    deleteUser
}