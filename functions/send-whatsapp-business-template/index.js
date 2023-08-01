import axios from "axios";

const senderPhoneId = process.env.SENDER_PHONE_ID
const recipientPhoneNumber = process.env.RESIPIENT_PHONE_NUMBER
const templateName = process.env.TEMPLATE_NAME
const templateLanguageCode = process.env.TEMPLATE_LANGUAGE_CODE
const metaAccessToken = process.env.META_ACCESS_TOKEN

export const handler = async () => {
    try {
        const message = await sentTemplate()
        return {
            statusCode: 200,
            body: JSON.stringify(message)
        }
    } catch (e) {
        console.log(e)
        return {
            statusCode: 500,
            body: JSON.stringify(e.data)
        }
    }
}

const sentTemplate = async () => {

    const response = await axios.post(`https://graph.facebook.com/${senderPhoneId}/messages`, {
        "messaging_product": "whatsapp",
        "to": recipientPhoneNumber,
        "type": "template",
        "template": {
            "name": templateName,
            "language": {
                "code": templateLanguageCode || "he"
            }
        }
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${metaAccessToken}`
        }
    })
    return response.data
}
