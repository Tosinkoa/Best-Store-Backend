import SendinBlue from "sib-api-v3-sdk";

const SendEmail = async (receiver, subject, textContent) => {
  const client = SendinBlue.ApiClient.instance;

  const apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const sender = {
    email: process.env.BREVO_EMAIL_SENDER,
  };
  const theReciver = [
    {
      email: receiver,
    },
  ];

  const transactionalEmailApi = new SendinBlue.TransactionalEmailsApi();

  transactionalEmailApi
    .sendTransacEmail({
      sender,
      to: theReciver,
      subject,
      textContent,
    })
    .then(console.log)
    .catch(console.log);
};

export default SendEmail;
