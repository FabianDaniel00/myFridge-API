const jwt = require("jsonwebtoken");
// require("dotenv").config();

const isUserAuthorized = (usersRouter) => {
  usersRouter.get("/auth", (req, res) => {
    const user = req.session.user;

    if (!user) {
      res.json({ user: "" });
    } else {
      jwt.verify(user.refreshToken, process.env.JWT_REFRESH, (err, decoded) => {
        if (err) {
          return res.json({
            err: "Please re-login to continue to use the application.",
          });
        } else if (user.data.u_id === decoded.u_id) {
          const token = jwt.sign(
            { u_id: user.data.u_id, u_is_admin: user.data.u_is_admin },
            process.env.JWT_SECRET,
            {
              expiresIn: 300,
            }
          );
          return res.json({ user: user.data, token: token });
        } else {
          return res.json({
            err: "Something went wrong during authentication.",
          });
        }
      });
    }
  });
};

exports.isUserAuthorized = isUserAuthorized;
