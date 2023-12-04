const nodemailer = require("nodemailer");
const asyncWrapper = require('../middlewares/asyncWrapper');

const SendMail = (options)=>{
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass:process.env.EMAIL_PASSWORD,
        },
    });

    const emailOptions ={
        from: '"fares elsadek 👻" <fares@e-commmerce.com>', 
        to: options.email, 
        subject: options.subject, 
        text: options.message
    };

    transporter.sendMail(emailOptions);
}

module.exports = SendMail;