const bcrypt = require("bcrypt");

const changeEmail = (usersRouter, pool, verifyJWT) => {
  usersRouter.post("/edit_email", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { email, emailPassword } = req.body;

        const emailReg =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const validEmail = emailReg.test(String(email).toLowerCase());

        if (!email || !emailPassword) {
          return res.json({ err: "Please fill out all the fields!" });
        } else if (!validEmail) {
          return res.json({ err: "Not valid email!" });
        } else {
          const CHECK_EMAIL_IS_EXIST =
            "SELECT u_id FROM users WHERE u_email = ?";
          pool.query(CHECK_EMAIL_IS_EXIST, email, (cErr, cResult) => {
            if (cErr) {
              console.log(cErr.message);
              return res.json({ err: "Something went wrong" });
            } else if (cResult.length) {
              return res.json({ err: "This email already exist" });
            } else {
              bcrypt.compare(
                emailPassword,
                user.data.u_password,
                (hashErr, same) => {
                  if (hashErr) {
                    console.log(hashErr.message);
                    return res.json({ err: "Something went wrong" });
                  } else if (!same) {
                    return res.json({ err: "Wrong password!" });
                  } else {
                    const CHANGE_EMAIL =
                      "UPDATE users SET u_email = ? WHERE u_id = ? AND u_password = ?;";
                    pool.query(
                      CHANGE_EMAIL,
                      [email, user.data.u_id, user.data.u_password],
                      (err, result) => {
                        if (err) {
                          console.log(err.message);
                          return res.json({ err: "Something went wrong" });
                        } else if (!result.affectedRows) {
                          return res.json({ err: "Something went wrong" });
                        } else {
                          user.data.u_email = email;
                          return res.json({
                            message: "Email successfully changed!",
                            newToken,
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          });
        }
      } else {
        return res.json({ err: "Something went wrong during authentication." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.changeEmail = changeEmail;
