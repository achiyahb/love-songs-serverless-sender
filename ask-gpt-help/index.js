import axios from "axios";
import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';

const SONG_QUEUE_URL = process.env.SONG_QUEUE_URL
const HELP_PROMPT = process.env.HELP_PROMPT
const client = new SQSClient({region: "eu-central-1"});

export const handler = async () => {
    const choices = await generateMessage(HELP_PROMPT)
    const message = await pushMessageToQueue({text: {body: choices[0].message.content}}, SONG_QUEUE_URL)
    return {
        statusCode: 200, body: message
    }
}

const generateMessage = async (prompt) => {
    try {
        const response = await axios.post(`https://api.openai.com/v1/chat/completions`, {
            "model": "gpt-3.5-turbo", "messages": [{
                "role": "user", "content": prompt
            }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.GPT_API_KEY}`
            },
        })
        return response.data.choices
    } catch (e) {
        console.log(e.response.data)
    }
}

const pushMessageToQueue = async (song, queueUrl) => {
    const params = {
        MessageBody: JSON.stringify(song), QueueUrl: queueUrl
    };
    const command = new SendMessageCommand(params);
    return client.send(command);
};


