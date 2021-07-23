const bcrypt = require("bcryptjs");

const makeAdminUser = (adminRouter, pool, verifyJWT) => {
  adminRouter.post("/make_admin_user", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const { u_id, admin_password, u_is_admin } = req.body;

        if (!u_id || !admin_password || u_is_admin === "") {
          return res.json({ err: "Missing parameters..." });
        } else {
          bcrypt.compare(admin_password, user.data.u_password, (bErr, same) => {
            if (bErr) {
              console.log(bErr.message);
              return res.json({ err: "Something went wrong." });
            } else if (!same) {
              return res.json({ wrongPassword: "Wrong password!" });
            } else {
              const MAKE_ADMIN_USER =
                "UPDATE users SET u_is_admin = !u_is_admin WHERE u_id = ?";

              pool.query(MAKE_ADMIN_USER, u_id, (err, result) => {
                if (err) {
                  console.log(err.message);
                  return res.json({ err: "Something went wrong." });
                } else if (!result.affectedRows) {
                  return res.json({ err: "Something went wrong." });
                } else {
                  return res.json({
                    message: u_is_admin
                      ? "Admin was given."
                      : "Admin was removed.",
                    newToken,
                  });
                }
              });
            }
          });
        }
      } else {
        return res.json({
          err: "Something went wrong during authentication.",
        });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.makeAdminUser = makeAdminUser;
