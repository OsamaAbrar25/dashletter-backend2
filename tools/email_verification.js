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

    signSendEmail : function(token, email) {
        jwt.sign(
            {
            username: token
            },
            'asdf1093KMnzxcvnkljvasdu09123nlasdasdf',
            {
            expiresIn: '1d',
            },
            (err, emailToken) => {
                const url = `https://dashletter-backend.herokuapp.com/confirmation/${emailToken}`;

                transporter.sendMail({
                to: email,
                subject: 'Confirm Email',
                html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
                });email
            },
        );
    }
}

  


  