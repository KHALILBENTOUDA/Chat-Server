const nodemailer = require('nodemailer');
const path = require('path');


const sendVerifyEmail = async (options) => {
  try {
    // create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      service: process.env.EMAIL_SERVICE,
      secure: process.env.EMAIL_SECURE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });



    // Define the email options
    const imagePath = path.join(__dirname, '2-removebg-preview.png');

    const mailOptions = {
      from: 'Matcha <' + process.env.EMAIL_USERNAME + '>',
      to: options.email,
      subject: options.subject,
      html: `
      <!doctype html>
      <html>
      <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   
      <link rel="stylesheet" href="/src/assets/fontawesome-free-6.0.0-web/css/all.min.css">
      <link rel="stylesheet" type="text/css" charset="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" /> 
      <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
        <style>
    
          .main-container {
            max-width:3xl;
            hight:100%;
            margin: auto;
            color: #ddd;
            background-color:black;
            font-family:sans-serif;
            border-radius:10px;
            padding: 25px;
          }
          .header{
            text-align: center;
          }
          .header img {
            width: 160px;
          }
        
        </style>
      </head>
      <body style="">
        <div class="main-container" style="">
          <header class="header" style="padding-bottom:40px">
            <a href="#">
              <img src="cid:myImg" alt="logo">
            </a>
          </header>
          
          ${options.main}

          <hr style="margin-top: 2rem;"/>
          <footer style="margin-top:10px; font-size:10px;text-align: center;" class="mt-8">
          <p style="color:#ddd">
          This email was sent to 
          <a href="#" style="color:#00E4E3" target="_blank">${options.email}</a>.
        </p>
  
          <p style="margin-top: 0.75rem; color: #718096;">
          © Copyrite 2024, Matcha. All Rights Reserved.
          </p>
      </footer>
        </div>
      </body>
    </html>
    
      `,
      attachments: [
        {
          path: imagePath,
          cid: 'myImg' 
        }
      ]
    };

    // Actually send the email
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Error sending email:', error.message);  
    throw error;
  }
};

module.exports = sendVerifyEmail;
