const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = (usersRouter, pool) => {
  usersRouter.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ err: "Can not be empty data!" });
    } else {
      const LOGIN_QUERY =
        "SELECT * FROM users WHERE u_email = ? AND u_is_deleted = 0";

      pool.query(LOGIN_QUERY, email, (err, result) => {
        if (err) {
          console.log(err.message);
          return res.json({ err: "Something went wrong during login!" });
        } else if (!result.length) {
          return res.json({ err: "This user does not exist!" });
        } else {
          bcrypt.compare(password, result[0].u_password, (hash_err, same) => {
            if (hash_err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong during login!" });
            } else if (same) {
              if (!result[0].u_is_verified) {
                return res.json({
                  err: `You are not verified! Please check the email ${email}`,
                });
              } else if (result[0].u_blocked) {
                return res.json({ err: "You are blocked!" });
              } else {
                const refreshToken = jwt.sign(
                  { u_id: result[0].u_id, u_is_admin: result[0].u_is_admin },
                  process.env.JWT_REFRESH,
                  {
                    expiresIn: 60 * 60 * 24,
                  }
                );
                const token = jwt.sign(
                  { u_id: result[0].u_id, u_is_admin: result[0].u_is_admin },
                  process.env.JWT_SECRET,
                  {
                    expiresIn: 300,
                  }
                );

                req.session.user = {
                  data: result[0],
                  refreshToken,
                };

                console.log(`Logged in: ${email}`);
                return res.json({
                  message: `Successful login as '${email}'`,
                  user: result[0],
                  token: token,
                });
              }
            } else {
              return res.json({ err: "Wrong email/password combination!" });
            }
          });
        }
      });
    }
  });
};

exports.login = login;
