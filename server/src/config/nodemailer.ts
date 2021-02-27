import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export const sendMail = async (mailOptions: Mail.Options) => {
  let transporter;
  if (process.env.NODE_ENV === "production") {
    // TODO: configure production email sending
    // with SES/Sendgrid/Mailgun/etc
  } else {
    // in non production environments,
    // default to ethereal email service
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  const info = await transporter?.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);

  // Preview only available when sending through an Ethereal account
  process.env.NODE_ENV !== "production" &&
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

// TODO: implement SES email transporter with env vars for AWS keys, etc.
