require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse POST request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Render the app page
app.get('/', (req, res) => {
    res.render('app');
});

// Handle form submission to send email
app.post('/send-email', (req, res) => {
    const { to, subject } = req.body;

    // Read the email template file
    const emailTemplate = fs.readFileSync('./views/email_template.ejs', 'utf8');

    // Compile the email template
    const compiledTemplate = ejs.compile(emailTemplate);

    // Define dynamic data for the email template
    const dynamicData = {
        recipientName: to.split('@')[0], 
        subject: subject,
        customMessage: 'This is a custom message for the recipient.'
    };

    // Render the email template with dynamic data
    const renderedEmail = compiledTemplate(dynamicData);

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define mail options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: renderedEmail 
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.send('Error sending email');
        } else {
            console.log('Email sent:', info.response);
            res.send('Email sent successfully');
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
