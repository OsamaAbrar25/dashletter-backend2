const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'dashletter01@gmail.com',
      pass: 'Crock7$Robust$Ranger$gory7$Amendable$6fife',
    },
});

module.exports = {

    EMAIL_SECRET : 'asdf1093KMnzxcvnkljvasdu09123nlasdasdf',

    signSendEmail : function(token, email) {
        jwt.sign(
            {
            id: token
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
                });
            },
        );
    }
}

  


  