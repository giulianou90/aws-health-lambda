import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient();

export const handler = async (event) => {
  const records = event.Records || [];
  const emailPromises = records.map(record => {
    const snsMessage = JSON.parse(record.Sns.Message);
    const formattedMessage = formatMessage(snsMessage);
    const params = {
      Destination: {
        ToAddresses: ['giuliano.ursino.90@gmail.com', 'ivo@nimbux911.com']
      },
      Message: {
        Body: {
          Text: { Data: formattedMessage }
        },
        Subject: { Data: "AWS Health Event Notification" }
      },
      Source: 'giuliano.ursino@nimbux911.com'
    };
    const command = new SendEmailCommand(params);
    return ses.send(command);
  });
  await Promise.all(emailPromises);
  return {
    statusCode: 200,
    body: JSON.stringify('Emails sent successfully'),
  };
};

function formatMessage(message) {
  return `
Event ARN: ${message.detail.eventArn}
Service: ${message.detail.service}
Event Type Code: ${message.detail.eventTypeCode}
Event Type Category: ${message.detail.eventTypeCategory}
Event Description: ${message.detail.eventDescription[0].latestDescription}
Start Time: ${message.detail.startTime}
Last Updated Time: ${message.detail.lastUpdatedTime}
Affected Entities: ${message.detail.affectedEntities.map(entity => entity.entityValue).join(", ")}
`;
}
