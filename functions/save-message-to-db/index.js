import {MongoClient} from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI;
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
    return await saveSong(event, context)
}

const SENDER_PHONE_NUMBER = process.env.SENDER_PHONE_NUMBER
const saveSong = async (event) => {

    const message = JSON.parse(event.Records[0].body)
    const isFromSender = message.from === SENDER_PHONE_NUMBER;
    const additionalData = isFromSender && {isSong: message.text.body.split('\n').length > 3, isSent: false}

    const newSong = await db.collection("songs-messages").insertOne({...message, ...additionalData, createdAt:new Date()})
    return {
        statusCode: 200,
        body: JSON.stringify(newSong),
    };
};


