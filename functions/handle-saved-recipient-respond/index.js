import {MongoClient} from "mongodb"
import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';

const MONGODB_URI = process.env.MONGODB_URI;
const PULL_SONG_QUEUE_URL = process.env.PULL_SONG_QUEUE_URL;
const RECIPIENT_NUMBER = process.env.RECIPIENT_NUMBER
const client = new SQSClient({region: "eu-central-1"});

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
export const handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const document = event.detail.fullDocument;
    const isRescipientResponse = document.from === RECIPIENT_NUMBER

    try {
        if(isRescipientResponse){

            const isRequestExists  = await isSendingRequestExists()


            if(isRequestExists){

                await pushMessageToQueue({message: 'pull love song'}, PULL_SONG_QUEUE_URL)
                return {
                    statusCode: 200,
                    body: 'push to queue',
                    isRequestExists
                }
            }
        }
        return {
            statusCode: 200,
            body: 'saved document handled'
        }
    } catch (e) {
        console.log(e)
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        }
    }
}

const isSendingRequestExists = async () => {
    const request = db.collection("send-requests").findOne({ isSent : false, createdAt : { $gt : new Date(Date.now()-1000*60*60*24*5) } })

    return !!request;
}

const pushMessageToQueue = async (song, queueUrl) => {

    const params = {
        MessageBody: JSON.stringify(song),
        QueueUrl: queueUrl
    };
    const command = new SendMessageCommand(params);
    return client.send(command);
};


