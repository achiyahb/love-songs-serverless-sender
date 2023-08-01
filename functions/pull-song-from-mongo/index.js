import pkg from 'mongodb';
const {MongoClient} = pkg;
import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';



const SONG_QUEUE_URL = process.env.SONG_QUEUE_URL
const MONGODB_URI = process.env.MONGODB_URI;
const SENDER_PHONE_NUMBER = process.env.SENDER_PHONE_NUMBER;
const EXCUSE_QUEUE_URL = process.env.EXCUSE_QUEUE_URL;
const client = new SQSClient({region: "eu-central-1"});

export const handler = async () => {
    try {
        const song = await getSongFromMongo()
        if (!song) {
            await pushMessageToQueue({message:'No song to send'},EXCUSE_QUEUE_URL)
            return {
                statusCode: 200,
                body: JSON.stringify('No song to send')
            }
        }
        const message = await pushMessageToQueue(song, SONG_QUEUE_URL)
        console.log(message)
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

    // Specify which database we want to use
    const db = await client.db("Love-Songs");

    cachedDb = db;
    return db;
}

const db = await connectToDatabase();

const getSongFromMongo = async () => {
    return db.collection("songs-messages").findOne({
        from: SENDER_PHONE_NUMBER,
        isSent: false,
        isSong: true,
        'text.body': {$exists: true}
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
