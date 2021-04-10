const {
  isUserAuthorized,
} = require("../users/authentication/isUserAuthorized.js");
const { register } = require("../users/register.js");
const { sendCodeAgain } = require("../users/sendCodeAgain.js");
const { login } = require("../users/login.js");
const { logout } = require("../users/logout.js");
const { resetPasswordSend } = require("../users/resetPasswordSend.js");
const { resetPasswordConfirm } = require("../users/resetPasswordConfirm.js");
const { pool } = require("../db-config");

const express = require("express");
const usersRouter = express.Router();

isUserAuthorized(usersRouter);
register(usersRouter, pool);
sendCodeAgain(usersRouter, pool);
login(usersRouter, pool);
logout(usersRouter);
resetPasswordSend(usersRouter, pool);
resetPasswordConfirm(usersRouter, pool);

exports.usersRouter = usersRouter;
