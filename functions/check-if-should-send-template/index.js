import {MongoClient} from 'mongodb';
import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';

const MONGODB_URI = process.env.MONGODB_URI;
const RECIPIENT_PHONE_NUMBER = process.env.RECIPIENT_PHONE_NUMBER;
const SEND_TEMPLATE_QUEUE_URL = process.env.SEND_TEMPLATE_QUEUE_URL;
const PULL_SONG_QUEUE_URL = process.env.PULL_SONG_QUEUE_URL;
const client = new SQSClient({region: "eu-central-1"});

export const handler = async () => {
    try {
        const isSessionAlive = await isConversationSessionAlive()

        if (!isSessionAlive) {
            await pushMessageToQueue({message: 'send template'}, SEND_TEMPLATE_QUEUE_URL)
            const request  = await createSendingRequest()
            return {
                statusCode: 200,
                body: JSON.stringify(request)
            }
        }
        const message = await pushMessageToQueue({message: 'pull song'}, PULL_SONG_QUEUE_URL)
        return {
            statusCode: 200,
            body: JSON.stringify(message)
        }
    } catch (e) {
        console.log(e)
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        }
    }
}

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const client = await MongoClient.connect(MONGODB_URI);

    const db = await client.db("Love-Songs");

    cachedDb = db;
    return db;
}

const db = await connectToDatabase();

const isConversationSessionAlive = async () => {
    const message = db.collection("songs-messages").findOne({
        from: RECIPIENT_PHONE_NUMBER,
        createdAt: {$gt: new Date(Date.now() - 1000 * 60 * 60 * 24)},
    })

    return !!message
}

const createSendingRequest = async () => {
    return db.collection("send-requests").insertOne({
        isSent: false,
        createdAt: new Date()
    })
}


const pushMessageToQueue = async (song, queueUrl) => {

    const params = {
        MessageBody: JSON.stringify(song),
        QueueUrl: queueUrl
    };
    const command = new SendMessageCommand(params);
    return client.send(command);
};
