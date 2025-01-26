const express = require('express');
const app = express();
const port = 3000;
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs'); 
const path = require('path');


const EMAIL = process.env.EMAIL;
const PASSWD = process.env.PASSWD;

console.log(`Credentials ${EMAIL}`);

//middlewares

//enable cors to anywhere
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
}));
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport(
    {
        service : 'gmail',
        auth : {
            user : EMAIL,
            pass : PASSWD
        }
    }
)


app.get('/', (req, res) => {
    res.send('api works');
});

app.post('/send-email', async (req, res) => {
    // verify fields email, subject, message and image, if not return 400 status

    if (!req.body.email || !req.body.subject || !req.body.message ) {
        console.log(req.body);
        return res.status(400).json({ error: 'Email, subject, message and image are required' });
    }


    try{
        let mailOptions = {
            from : EMAIL,
            to : req.body.email,
            subject : req.body.subject,
            text : req.body.message,
            attachments : []
        }

        if (req.body.image) {
            mailOptions.attachments.push({
              filename: "imagen.png",
              content:   req.body.image,
            //   path: req.body.image.startsWith("http") ? req.body.image : undefined,
              encoding: "base64",
            });
        }

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Email sent' });

    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Error sending email' });
    }



});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});