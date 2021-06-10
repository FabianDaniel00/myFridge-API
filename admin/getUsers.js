const getUsers = (adminRouter, pool, verifyJWT) => {
  adminRouter.get("/get_users", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const GET_USERS =
          "SELECT u_id, u_f_name, u_l_name, u_email, u_tel, u_is_verified, u_is_blocked FROM users WHERE u_is_deleted = 0";

        pool.query(GET_USERS, (err, result) => {
          if (err) {
            console.log(err.message);
            return res.json({ err: "Something went wrong." });
          } else {
            return res.json({ users: result, newToken });
          }
        });
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

exports.getUsers = getUsers;
