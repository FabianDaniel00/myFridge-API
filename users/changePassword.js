const bcrypt = require("bcryptjs");

const changePassword = (usersRouter, pool, verifyJWT) => {
  usersRouter.post("/edit_password", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { password, newPassword } = req.body;

        const passwordReg =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        const validPassword = passwordReg.test(newPassword);

        if (!password || !newPassword) {
          return res.json({ err: "Please fill out all the fields!" });
        } else if (!validPassword) {
          return res.json({
            err: "The password must be 8 characters long and must contain at least 1 lowercase, 1 uppercase, 1 numeric and 1 special character",
          });
        } else {
          bcrypt.compare(password, user.data.u_password, (hashErr, same) => {
            if (hashErr) {
              console.log(hashErr.message);
              return res.json({ err: "Something went wrong" });
            } else if (!same) {
              return res.json({ err: "Wrong old password!" });
            } else {
              bcrypt.hash(newPassword, 10, (encryptErr, encryptResult) => {
                if (encryptErr) {
                  console.log(encryptErr.message);
                  return res.json({ err: "Something went wrong" });
                } else {
                  const EDIT_PASSWORD =
                    "UPDATE users SET u_password = ? WHERE u_id = ? AND u_email = ? AND u_is_deleted = 0 AND users.u_is_verified = 1 AND users.u_is_blocked = 0;";
                  pool.query(
                    EDIT_PASSWORD,
                    [encryptResult, user.data.u_id, user.data.u_email],
                    (err, result) => {
                      if (err) {
                        console.log(err.message);
                        return res.json({ err: "Something went wrong" });
                      } else if (!result.affectedRows) {
                        return res.json({ err: "Something went wrong" });
                      } else {
                        user.data.u_password = encryptResult;
                        return res.json({
                          message: "Success password change",
                          newToken,
                          newPasswordHash: encryptResult,
                        });
                      }
                    }
                  );
                }
              });
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

exports.changePassword = changePassword;
