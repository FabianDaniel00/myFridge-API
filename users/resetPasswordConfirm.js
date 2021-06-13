const bcrypt = require("bcrypt");
const moment = require("moment");

const resetPasswordConfirm = (usersRouter, pool) => {
  usersRouter.post("/reset_password_confirm", (req, res) => {
    const { verificationCode, email, newPassword } = req.body;

    const emailReg =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const validEmail = emailReg.test(String(email).toLowerCase());
    const passwordReg =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    const validPassword = passwordReg.test(newPassword);

    if (!verificationCode || !newPassword || !email) {
      return res.json({ err: "Can not be empty data!" });
    } else if (!validEmail) {
      return res.json({ err: "Not valid email!" });
    } else if (!validPassword) {
      return res.json({
        err: "The password must be 8 characters long and must contain at least 1 lowercase, 1 uppercase, 1 numeric and 1 special character",
      });
    } else {
      const SELECT_USER = "SELECT * FROM users WHERE u_email = ?";

      pool.query(SELECT_USER, email, (err, result) => {
        if (err) {
          console.log(err.message);
          return res.json({ err: "Something went wrong." });
        } else if (!result.length) {
          return res.json({ err: "This user does not exists!" });
        } else {
          const expireDate = moment(
            result[0].u_reset_pass_expiration_date,
            "YYYY-MM-DD HH:mm:ss"
          );
          const dateNow = moment(new Date(), "YYYY-MM-DD HH:mm:ss");

          if (!result[0].u_is_verified) {
            return res.json({ err: "This user is not verified yet!" });
          } else if (dateNow > expireDate) {
            return res.json({ err: "Sorry, this code is expired!" });
          } else {
            bcrypt.compare(
              verificationCode,
              result[0].verification_code,
              (compare_err, same) => {
                if (compare_err) {
                  console.log(compare_err.message);
                  return res.json({ err: "Something went wrong!" });
                } else if (!same) {
                  return res.json({ err: "The code is incorrect!" });
                } else {
                  bcrypt.hash(newPassword, 10, (hash_err, encrypted) => {
                    if (hash_err) {
                      console.log(hash_err.message);
                      return res.json({ err: "Something went wrong." });
                    } else {
                      const RESET_PASSWORD =
                        "UPDATE users SET u_password = ?, verification_code = ?, u_reset_pass_expiration_date = ? WHERE u_email = ? AND u_is_deleted = 0";

                      pool.query(
                        RESET_PASSWORD,
                        [encrypted, null, null, email],
                        (reset_err, reset_result) => {
                          if (reset_err) {
                            console.log(reset_err.message);
                            return res.json({ err: "Something went wrong." });
                          } else if (!reset_result.changedRows) {
                            return res.json({ err: "Something went wrong." });
                          } else {
                            console.log(`Password changed by user: ${email}`);
                            return res.json({
                              message: `The password is successfully changed, email: ${email}`,
                            });
                          }
                        }
                      );
                    }
                  });
                }
              }
            );
          }
        }
      });
    }
  });
};

exports.resetPasswordConfirm = resetPasswordConfirm;
