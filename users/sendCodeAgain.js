const { sendEmailCode } = require("./sendEmailCode.js");
const moment = require("moment");
const bcrypt = require("bcryptjs");

const sendCodeAgain = (usersRouter, pool) => {
  usersRouter.post("/send_code_again", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ err: "Can not be empty data!" });
    } else {
      const SELECT_USER =
        "SELECT * FROM users WHERE u_email = ? AND u_is_deleted = 0;";

      pool.query(SELECT_USER, email, (err, result) => {
        if (err) {
          console.log(err.message);
          return res.json({ err: "Something went wrong." });
        } else if (!result.length) {
          return res.json({ err: "This user does not exist." });
        } else {
          bcrypt.compare(password, result[0].u_password, (compareErr, same) => {
            if (compareErr) {
              console.log(compareErr.message);
              return res.json({ err: "Something went wrong." });
            } else if (!same) {
              return res.json({ err: "Wrong email/password combination!" });
            } else {
              const delayDuration = 5;
              const delay = moment(
                moment(result[0].verification_code_sent_date)
                  .add(delayDuration, "minutes")
                  .toDate(),
                "YYYY-MM-DD HH:mm:ss"
              );
              const dateNow = moment(new Date(), "YYYY-MM-DD HH:mm:ss");
              if (result[0].u_is_verified) {
                return res.json({ err: "This user is already verified." });
              } else if (delay > dateNow) {
                const difference = delay.diff(dateNow, "seconds");
                return res.json({
                  err: `Sorry, you have to wait ${(
                    difference / 60
                  ).toFixed()} minutes and ${
                    difference % 60
                  } seconds to resend the code.`,
                });
              } else {
                const REFRESH_SEND_DATE =
                  "UPDATE users SET verification_code_sent_date = ? WHERE u_id = ? AND u_is_deleted = 0;";
                pool.query(
                  REFRESH_SEND_DATE,
                  [
                    moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                    result[0].u_id,
                  ],
                  (refreshError, refreshResult) => {
                    if (refreshError) {
                      console.log(refreshError.message);
                      return res.json({
                        err: "Something went wrong during sending the code.",
                      });
                    } else if (!refreshResult.changedRows) {
                      return res.json({
                        err: "Something went wrong during sending the code.",
                      });
                    } else {
                      sendEmailCode(
                        email,
                        result[0].u_f_name,
                        result[0].u_l_name,
                        result[0].verification_code,
                        res,
                        true
                      );
                    }
                  }
                );
              }
            }
          });
        }
      });
    }
  });
};

exports.sendCodeAgain = sendCodeAgain;
