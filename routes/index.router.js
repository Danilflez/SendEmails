const express = require("express");
const router = express.Router();
const emailСontroller = require("../contollers/emailСontroller");



router.post("/email/SendMessage", emailСontroller.SendMessage);


module.exports = router;
