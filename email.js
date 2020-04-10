const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'dashletter01@gmail.com',
      pass: 'Crock7$Robust$Ranger$gory7$Amendable$6fife',
    },
  });

EMAIL_SECRET = 'h&rju68BDQWNdTra4IKjAH%x$gTCI$&A';

 function signSendEmail(id, email) {
    jwt.sign(
        {
          id,
        },
        EMAIL_SECRET,
        {
          expiresIn: '1d',
        },
        (err, emailToken) => {
            const url = `https://dashletter-backend.herokuapp.com/confirmation/${emailToken}`;

            transporter.sendMail({
            to: email,
            subject: 'Confirm Email',
            html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
            });
        },
    );
}

export {signSendEmail, EMAIL_SECRET};


  


  