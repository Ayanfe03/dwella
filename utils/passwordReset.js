const nodemailer = require('nodemailer');

const sendpasswordResetEmail = async (email, passwordResetToken) => {
 
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: `"Dwella Team" <${process.env.EMAIL_USER}>`,
    to: `${email}`,
    subject: 'Password Reset Request for Dwella',
    html: `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: left; /* Left-align the text */
          font-size: 18px; /* Increase the font size */
        }
        .email-body {
          width: 100%;
          max-width: 600px;
          margin: 0 auto; /* Center the entire content */
          text-align: left; /* Left-align the content */
        }
        h1 {
          font-size: 24px;
        }
        p {
          font-size: 18px;
        }
        a {
          display: inline-block;
          background-color: #007BFF;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          font-size: 18px;
          border-radius: 5px;
          margin-top: 20px;
        }
        a:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="email-body">
        <h1>Hi,</h1>
        <p style="margin-bottom: 0; padding-bottom: 0;">
          We received a request to update the password for your Dwella Account.<br>
          To reset your password, click the link below:
        </p>
        <a href="https://dwella.onrender.com/v1/users/password-reset?passwordResetToken=${passwordResetToken}" style="
             display: inline-block;
             padding: 7px 14px;
             color: #ffffff; 
             background-color: #000000; 
             text-decoration: none; 
             border-radius: 5px;
           ">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p style="margin-bottom: 0; padding-bottom: 0;">
          Thank you,<br>
          The Dwella Team
        </p>
      </div>
    </body>
  </html>
  `
};

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error)
    } else {
      console.log('Password Reset Email sent: ', info.response)
    }
  });
}


module.exports = sendpasswordResetEmail;