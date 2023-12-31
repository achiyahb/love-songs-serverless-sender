import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';

const SONGS_QUEUE_URL = process.env.SONGS_QUEUE_URL
const client = new SQSClient({region: "eu-central-1"});

export const handler = async (event) => {
    if (!event?.entry?.length || !event?.entry[0].changes?.length || !event?.entry[0].changes[0].value?.messages?.length || !event?.entry[0].changes[0].value?.messages[0].text?.body) {
        return
    }
    const message = event?.entry[0].changes[0].value?.messages[0];

    const params = {
        MessageBody: JSON.stringify(message),
        MessageGroupId: 123,
        QueueUrl: SONGS_QUEUE_URL
    };

    let response;
    const command = new SendMessageCommand(params);
    try {
        const data = await client.send(command);
        if (data) {
            const bodyMessage = 'Message Send to SQS- Here is MessageId: ' + data.MessageId;
            response = {
                statusCode: 200,
                body: JSON.stringify(bodyMessage),
            };
        } else {
            response = {
                statusCode: 500,
                body: JSON.stringify('Some error occurred')
            };
        }

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err)
        };

    }
    return response
};

