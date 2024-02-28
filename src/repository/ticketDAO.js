const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    UpdateCommand,
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

const viewTickets = async (employee_id) => {
    const command = new QueryCommand({
        TableName,
        KeyConditionExpression:
            "employee_id = :employee_id",
        ExpressionAttributeValues: {
            ":employee_id": employee_id,
        },
        ConsistentRead: true,
    });

    try {
        const data = await documentClient.send(command);
        return data.Items[0].tickets;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const createTicket = async (employee_id, ticket) => {
    const command = new UpdateCommand({
        TableName,
        Key: {
            employee_id
        },
        UpdateExpression: "SET #t = list_append(#t, :vals)",
        ExpressionAttributeNames: {
            "#t": "tickets"
        },
        ExpressionAttributeValues: {
            ":vals": [
                {
                    "ticket_id": ticket.ticket_id,
                    "price": ticket.amount,
                    "description": ticket.description,
                    "status": ticket.status
                }
            ]
        },
        ReturnValues: "UPDATED_NEW"
    });

    try {
        const data = await documentClient.send(command);
        return data.Attributes.tickets;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const changeStatus = async (employee_id, ticket_id, status, manager_id) => {
    const command = new UpdateCommand({
        TableName,
        Key: {
            employee_id
        },
        UpdateExpression: `SET tickets[${ticket_id}].#s = :vals, tickets[${ticket_id}].#m = :id`,
        ExpressionAttributeNames: {
            "#m": "manager_id",
            "#s": "status"
        },
        ExpressionAttributeValues: {
            ":vals": status,
            ":id": manager_id
        },
        ReturnValues: "UPDATED_NEW",
    });

    try {
        const data = await documentClient.send(command);
        return data.Attributes.tickets[0];
    } catch (error) {
        logger.error(error);
        return null;
    }
};

const allEmployeeTickets = async (role) => {
    const command = new QueryCommand({
        TableName,
        IndexName: "role-index",
        KeyConditionExpression: "#r = :r",
        ExpressionAttributeNames: { "#r": "role" },
        ExpressionAttributeValues: { ":r": role }
    });

    try {
        const data = await documentClient.send(command);
        return data.Items;
    } catch (error) {
        logger.error(error);
        return null;
    }
};


module.exports = {
    viewTickets,
    createTicket,
    changeStatus,
    allEmployeeTickets
}