const nodemailer = require('nodemailer');


let transporter;

const initEmailService = async () => {
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

    console.log("Email Service Initialized with Ethereal:");
    console.log("User:", testAccount.user);
    console.log("Pass:", testAccount.pass);
};

const sendEmail = async (to, subject, text) => {
    if (!transporter) await initEmailService();

    const info = await transporter.sendMail({
        from: '"ProcureAI System" <system@procureai.example>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: `<b>${text.replace(/\n/g, '<br>')}</b>`, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
};

module.exports = {
    sendEmail
};
