import express from 'express';
import AWS from 'aws-sdk';

const router = express.Router();

AWS.config.update({
    region: 'us-west-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'User';

router.get('/', async (req, res) => {
    const params = {
        TableName: dynamodbTableName
    }
    try {
        const allUsers = await scanDynamoRecords(params, []);
        const body = {
            users: allUsers
        }
        res.json(body)
    } catch (err) {
        console.error(err);
        res.status(500).send(err); 
    }
})

async function scanDynamoRecords(scanParams, itemArray) {
    try {
        const dynamoData = await dynamodb.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items);
        if(dynamoData.LastEvaluatedKey) {
            scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray;
    } catch(err) {
        throw new Error(err); 
    }
}

// router.post('/login', async (req, res) => {

// })

// router.post('/register', async (req, res) => {

// })

export default router;