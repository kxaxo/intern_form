import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import { config } from 'dotenv';
config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.static("public"))

const storage = multer.diskStorage({
    destination : function (req, file, cb) {
        cb(null, 'file_upload/')
    },
    filename : function(req, file, cb) {
        const original_name = path.parse(file.originalname).name;
        const time = new Date();

        const day = time.getDate().toString().padStart(2, '0');
        const month = (time.getMonth() + 1).toString().padStart(2, '0');
        const year = time.getFullYear();
        const file_name = `${original_name}_${day}_${month}_${year}.pdf`;
        cb(null, file_name);
    }
});

const upload = multer({
    storage : storage,
    fileFilter : function(req, file, cb){
        const type_file = path.extname(file.originalname);
        if (type_file !== '.pdf') {
            return cb(new Error('Send the pdf file only.'));
        }
        cb(null, true);
    }
});

app.get("", (req, res) => {
    res.render("internship-form.ejs");
});

app.post("", upload.single('resume_pdf'), (req, res) => {
    const uploadedFile = req.file;
    const result = req.body
    console.log(result);



    // create transporter
    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        }
    });

    // define the email message
    const mailOptions = {
        from : process.env.EMAIL,
        to : req.body["email"],
        subject : "Response from hr",
        text : "Received from successfully."
    };

    // use transporter to send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send("Error sending email");
        } else {
            console.log("Email sent : " + info.response);
            res.status(200).send("Email sent successfully");
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})