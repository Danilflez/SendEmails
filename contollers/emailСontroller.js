const sql = require("../database");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils");
const nodemailer = require("nodemailer");
const { v4 } = require("uuid");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "webisupagency@gmail.com",
        pass: "lkil gttp gykx phvx",
    },
});

const emailСontroller = {
    SendMessage: async (req, res) => {
        try {
            const { emails, body, name } = req.body; // emails — массив почт
            if (!Array.isArray(emails) || emails.length === 0) {
                return res.status(400).json({ error: "Список email-адресов пуст или отсутствует" });
            }

            const mailPromises = emails.map(async (email) => {
                const mailBody = `
                    <div>
                        <h1 style='color: #6f4ff2'>WEBI Marketplace</h1>
                        <h2>Name: <span style='color: #6f4ff2'>${name}</span></h2>
                        <h2>Email: <span style='color: #6f4ff2'>${email}</span></h2>
                        <h2>Body: <span style='color: #6f4ff2'>${body}</span></h2>
                    </div>
                `;

                const mailOptions = {
                    from: "Webi",
                    to: email,
                    html: mailBody,
                    subject: "Обращение в поддержку",
                };

                // Отправка письма
                return new Promise((resolve, reject) => {
                    transporter.sendMail(mailOptions, (error) => {
                        if (error) {
                            reject(`Ошибка отправки письма на ${email}: ${error.message}`);
                        } else {
                            resolve(`Письмо на ${email} успешно отправлено`);
                        }
                    });
                });
            });

            // Ждём завершения отправки всех писем
            const results = await Promise.allSettled(mailPromises);

            // Собираем результаты
            const success = results
                .filter((result) => result.status === "fulfilled")
                .map((result) => result.value);
            const errors = results
                .filter((result) => result.status === "rejected")
                .map((result) => result.reason);

            res.json({
                message: "Процесс отправки завершён",
                success,
                errors,
            });
        } catch (error) {
            res.status(500).json({ error: "Ошибка обработки запроса в поддержку" });
        }
    },
};

module.exports = emailСontroller;
