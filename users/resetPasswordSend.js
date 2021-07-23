const { sendEmailCode } = require("./sendEmailCode.js");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const resetPasswordSend = (usersRouter, pool) => {
  usersRouter.post("/reset_password_send", (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.json({ err: "Can not be empty data!" });
    } else {
      const SELECT_USER =
        "SELECT * FROM users WHERE u_email = ? AND u_is_deleted = 0";

      pool.query(SELECT_USER, email, (err, result) => {
        if (err) {
          console.log(err.message);
          return res.json({ err: "Something went wrong." });
        } else if (!result.length) {
          return res.json({ err: "This user does not exist." });
        } else {
          const delayDuration = 10;
          const delay = moment(
            moment(result[0].verification_code_sent_date)
              .add(delayDuration, "minutes")
              .toDate(),
            "YYYY-MM-DD HH:mm:ss"
          );
          const dateNow = moment(new Date(), "YYYY-MM-DD HH:mm:ss");

          if (!result[0].u_is_verified) {
            return res.json({ err: "This account is not verified yet!" });
          } else if (delay > dateNow) {
            const difference = delay.diff(dateNow, "seconds");
            return res.json({
              err: `Sorry, you have to wait ${Math.floor(
                difference / 60
              )} minutes and ${difference % 60} seconds to resend the code.`,
            });
          } else {
            const verificationCode = uuidv4().substring(0, 8);
            bcrypt.hash(verificationCode, 10, (hash_err, encrypted) => {
              if (hash_err) {
                console.log(hash_err);
                return res.json({
                  err: "Something went wrong during sending the code.",
                });
              } else {
                const codeExpire = moment(new Date())
                  .add(delayDuration, "minutes")
                  .format("YYYY-MM-DD HH:mm:ss");
                const SET_CODE =
                  "UPDATE users SET verification_code = ?, verification_code_sent_date = ?, u_reset_pass_expiration_date = ? WHERE u_id = ? AND u_is_deleted = 0";
                pool.query(
                  SET_CODE,
                  [
                    encrypted,
                    moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                    codeExpire,
                    result[0].u_id,
                  ],
                  (setCodeError, setCodeResult) => {
                    if (setCodeError) {
                      console.log(setCodeError.message);
                      return res.json({
                        err: "Something went wrong during sending the code.",
                      });
                    } else if (!setCodeResult.changedRows) {
                      return res.json({
                        err: "Something went wrong during sending the code.",
                      });
                    } else {
                      sendEmailCode(
                        email,
                        result[0].u_f_name,
                        result[0].u_l_name,
                        verificationCode,
                        res,
                        false
                      );
                    }
                  }
                );
              }
            });
          }
        }
      });
    }
  });
};

exports.resetPasswordSend = resetPasswordSend;
