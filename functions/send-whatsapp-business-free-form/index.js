import axios from "axios";
import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';

const senderPhoneId = process.env.SENDER_PHONE_ID
const recipientPhoneNumber = process.env.RESIPIENT_PHONE_NUMBER
const metaAccessToken = process.env.META_ACCESS_TOKEN
const UPDATE_MESSAGE_QUEUE_URL = process.env.UPDATE_MESSAGE_QUEUE_URL

const client = new SQSClient({region: "eu-central-1"});
export const handler = async (event) => {
    try {

        const stringSong = event.Records[0].body
        const parsedSong =JSON.parse(stringSong)
        const message = await sentFreeForm(parsedSong.text.body)
        const queueResponse = await pushMessageToQueue({message, parsedSong}, UPDATE_MESSAGE_QUEUE_URL)
        return {
            statusCode: 200,
            body: JSON.stringify(queueResponse)
        }
    } catch (e) {
        console.log(e)
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        }
    }
}


const sentFreeForm = async (message) => {

    const response = await axios.post(`https://graph.facebook.com/${senderPhoneId}/messages`, {
        "messaging_product": "whatsapp",
        "to": recipientPhoneNumber,
        "type": "text",
        "text": {
            "preview_url": false,
            "body":message
        }
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${metaAccessToken}`
        }
    })
    return response.data
}

const pushMessageToQueue = async (song, queueUrl) => {

    const params = {
        MessageBody: JSON.stringify(song),
        QueueUrl: queueUrl
    };
    const command = new SendMessageCommand(params);
    return client.send(command);
};
