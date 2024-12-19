const nodemailer = require('nodemailer');

const sendGmail = async (email, emailVerificationToken) => {
 
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
    subject: 'Verify your email address',
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
      </style>\
    </head>
    <body>
      <div class="email-body">
        <h1>Hi,</h1>
        <p>Thanks for signing up! Please verify your email address by clicking the link below:</p>
        <a href="http://localhost:5000/v1/users/verify-email?emailVerificationToken=${emailVerificationToken}"  style="
             display: inline-block;
             padding: 7px 14px;
             color: #ffffff; 
             background-color: #000000; 
             text-decoration: none; 
             border-radius: 5px;
           ">Verify Email</a>
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
      console.log('Verification Email sent: ' + info.response)
    }
  });
}


module.exports = sendGmail;