require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const nodemailer = require("nodemailer");
const indexRouter = require("./routes/index.router");
const app = express();
const { Server } = require("socket.io");
const { PORT, EMAIL_USER, EMAIL_PASS } = process.env;
const { createServer } = require("node:http");

const corsOptions = {
    origin: [
        "http://localhost:3000",
        "http://localhost:3005"
    ],
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
};
const server = createServer(app);
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api", indexRouter);

app.get('/download', (req, res) => {
    const filePath = path.join(__dirname, 'pdf', '1_2_3_4_5_6_7_8_merged (2).pdf'); 
    res.download(filePath, (err) => {
        if (err) {
            console.error('Ошибка при скачивании файла:', err);
            res.status(500).send("Ошибка при скачивании файла");
        }
    });
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "webisupagency@gmail.com",
        pass:"lkil gttp gykx phvx",
    },
});

async function sendEmails() {
    try {
        const data = JSON.parse(fs.readFileSync("./emails.json", "utf8"));
        const emails = data.emails;

        if (!Array.isArray(emails) || emails.length === 0) {
            console.log("Список email-адресов пуст");
            return;
        }


        for (const email of emails) {
            const mailOptions = {
                from: EMAIL_USER,
                to: email,
                subject: "Автоматическое сообщение",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; width: 600px; margin: 50px auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:logo" alt="Логотип" style="width: 250px; height: auto;">
    </div>
    <div style="background-image: url('cid:bg'); background-size: cover; background-position: center; height: 300px; margin-bottom: 20px;">
    </div>
    <div style="margin: 20px;">
        <h1 style="margin-top: 20px;">Здравствуйте!</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">
            Мы рады сообщить вам, что у нас появился новый сервис — чат-бот на основе искусственного интеллекта для интернет-магазинов! Этот инструмент поможет вам автоматизировать общение с клиентами, отвечать на вопросы, обрабатывать заказы и увеличивать продажи.
        </p>
        <p style="font-size: 16px; margin-bottom: 20px;">
           Ознакомьтесь с более подробной информацией о сервисе в прилагаемом файле!
        </p>
    </div>
    <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://cloud.mail.ru/public/pXL5/bae6epFuz" style="display: inline-block; padding: 15px 30px; color: #fff; background-color: #CC65E8; text-decoration: none; border-radius: 10px; font-size: 16px;">
            Посмотреть файл
        </a>
    </div>
    <div style="font-size: 12px; color: #999; margin: 20px; text-align: center;">
        <p>© 2024 Lightning</p>
    </div>
</div>
                `,
                attachments: [
                    {
                        filename: "Group 533.png",
                        path: path.join(__dirname, "image", "Group 533.png"),
                        cid: "logo",  // Это CID, которое используется в HTML для ссылки на изображение
                    },
                    {
                        filename: "Bg.png",
                        path: path.join(__dirname, "image", "Bg.png"),
                        cid: "bg",  // Это CID, которое используется в HTML для ссылки на фоновое изображение
                    },
                ],
            };

            await transporter.sendMail(mailOptions);
            console.log(`Письмо отправлено на ${email}`);
        }
        console.log("Все письма успешно отправлены");
    } catch (error) {
        console.error("Ошибка при отправке писем:", error.message);
    }
}


sendEmails()

server.listen(PORT, () =>
    console.log(`Сервер запущен: http://localhost:${PORT}`)
);
