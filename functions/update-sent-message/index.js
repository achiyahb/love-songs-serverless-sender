import {MongoClient, ObjectId} from "mongodb"

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

    const stringMessage = event.Records[0].body
    const parsedMessage = JSON.parse(stringMessage)


    try {
        await updateSendingRequest()
        if (parsedMessage?.parsedSong?._id) {
            return await updateSong(parsedMessage.parsedSong._id)
        }
    } catch (e) {
        console.log(e)
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        }
    }
}

const updateSong = async (songId) => {
    return db.collection("songs-messages").updateOne({_id: new ObjectId(songId)}, {
        $set: {
            isSent: true,
            updatedAt: new Date()
        }
    })
};

const updateSendingRequest = async () => {
    return db.collection("send-requests").updateMany({
        isSent: false,
    }, {
        $set: {isSent: true, updatedAt: new Date()}
    });
}
