import {CreateScheduleCommand, SchedulerClient} from "@aws-sdk/client-scheduler";

const client = new SchedulerClient({region: "eu-central-1"});

export const handler = async () => {
    const date = setRandomDate()
    try {
        const response = await createScheduler(date)
        return {
            statusCode: 200,
            body: JSON.stringify(response)
        }
    } catch (e) {
        console.log(e)
    }
}

const setRandomDate = () => {
    const hourInMillis = 60 * 60 * 1000;
    const dayInMillis = 24 * hourInMillis;
    const randomDays = Math.floor(Math.random() * 4)
    const randomHours = Math.ceil(Math.random() * 10)
    const randomAdditionalTime = randomDays * dayInMillis + randomHours * hourInMillis;
    return new Date(new Date().getTime() + randomAdditionalTime).toISOString().split('.')[0]
}

const createScheduler = async (dateTime) => {
    const dateName = dateTime.split(/T/g)[0].split(/-/g).join('');
    const command = new CreateScheduleCommand({
        Name: `schedule-send-randomly-2${dateName}`,
        ScheduleExpression: `at(${dateTime})`,
        FlexibleTimeWindow: {
            Mode: 'OFF'
        },
        Target: {
            Arn: process.env.LAMBDA_ARN,
            RoleArn: process.env.ROLE_ARN,
        }
    });
    return await client.send(command);
}

