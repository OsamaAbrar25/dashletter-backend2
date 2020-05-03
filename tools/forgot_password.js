const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'dashletter01@gmail.com',
      pass: 'dashletter@2020',
    },
});

module.exports = {

    signSendEmailFP : function(otp, email) {

        transporter.sendMail({
        to: email,
        subject: 'Reset Password',
        html: `Please enter this otp ${otp}`
            
        }).then(()=>{
            console.log('email send');
        }).catch((err)=>{
            console.log(err);
        });
    }
}
  