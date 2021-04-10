const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { sendEmailCode } = require("./sendEmailCode.js");
const axios = require("axios");

const register = (usersRouter, pool) => {
  usersRouter.post("/register", (req, res) => {
    const { fName, lName, password, email, tel, reToken } = req.body;

    const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const validEmail = emailReg.test(String(email).toLowerCase());
    const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    const validPassword = passwordReg.test(password);

    const validateHuman = async () => {
      let validate = false;
      await axios
        .post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${reToken}`
        )
        .then((response) => {
          validate = response.data.success;
        })
        .catch((err) => {
          console.log(err.message);
          res.json({ err: err.message });
          validate = false;
        });

      return validate;
    };

    if (!validateHuman()) {
      return res.json({ err: "You are not a human!" });
    } else if (!fName || !lName || !password || !email) {
      return res.json({ err: "Can not be empty data!" });
    } else if (!validEmail) {
      return res.json({ err: "Not valid email!" });
    } else if (!validPassword) {
      return res.json({
        err:
          "The password must be 8 characters long and must contain at least 1 lowercase, 1 uppercase, 1 numeric and 1 special character",
      });
    } else {
      const CHECK_USER_IS_EXIST = "SELECT * FROM users WHERE u_email = ?";
      pool.query(CHECK_USER_IS_EXIST, email, (err, result) => {
        if (err) {
          console.log(err.message);
          return res.json({ err: "Something went wrong during registration." });
        } else if (result.length) {
          return res.json({ err: "This user already exists!" });
        } else {
          bcrypt.hash(password, 10, (hash_err, encrypted) => {
            if (hash_err) {
              console.log(hash_err.message);
              return res.json({
                err: "Something wong during registration.",
              });
            } else {
              const verification_code = uuidv4().substring(0, 8);
              const REGISTER_USER =
                "INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
              pool.query(
                REGISTER_USER,
                [
                  uuidv4(),
                  fName,
                  lName,
                  encrypted,
                  email,
                  tel === "" ? null : tel,
                  fName[0] + lName[0],
                  false,
                  false,
                  false,
                  verification_code,
                  moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                  moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                  null,
                ],
                (register_err, register_result) => {
                  if (register_err) {
                    console.log(register_err.message);
                    return res.json({
                      err: "Something wong during registration.",
                    });
                  } else if (!register_result.affectedRows) {
                    return res.json({
                      err: "Something wong during registration.",
                    });
                  } else {
                    sendEmailCode(
                      email,
                      fName,
                      lName,
                      verification_code,
                      res,
                      true
                    );
                    console.log(`Successful register, email: '${email}'`);
                    return res.json({
                      message: `Successful register as '${email}, your verification code was sent to your e-mail.'`,
                    });
                  }
                }
              );
            }
          });
        }
      });
    }
  });
};

exports.register = register;
