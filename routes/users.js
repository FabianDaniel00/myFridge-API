const {
  isUserAuthorized,
} = require("../users/authentication/isUserAuthorized.js");
const { register } = require("../users/register.js");
const { registerVerification } = require("../users/registerVerification.js");
const { sendCodeAgain } = require("../users/sendCodeAgain.js");
const { login } = require("../users/login.js");
const { logout } = require("../users/logout.js");
const { resetPasswordSend } = require("../users/resetPasswordSend.js");
const { resetPasswordConfirm } = require("../users/resetPasswordConfirm.js");
const { changeFName } = require("../users/changeFName.js");
const { changeLName } = require("../users/changeLName.js");
const { changeEmail } = require("../users/changeEmail.js");
const { changeTel } = require("../users/changeTel.js");
const { changePassword } = require("../users/changePassword.js");
const { pool } = require("../db-config");
const { verifyJWT } = require("./verifyJWT.js");

const express = require("express");
const usersRouter = express.Router();

isUserAuthorized(usersRouter);
register(usersRouter, pool);
registerVerification(usersRouter, pool);
sendCodeAgain(usersRouter, pool);
login(usersRouter, pool);
logout(usersRouter);
resetPasswordSend(usersRouter, pool);
resetPasswordConfirm(usersRouter, pool);
changeFName(usersRouter, pool, verifyJWT);
changeLName(usersRouter, pool, verifyJWT);
changeEmail(usersRouter, pool, verifyJWT);
changeTel(usersRouter, pool, verifyJWT);
changePassword(usersRouter, pool, verifyJWT);

exports.usersRouter = usersRouter;
