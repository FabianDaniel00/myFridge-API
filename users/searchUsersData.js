const searchUsersData = (usersRouter, pool, verifyJWT) => {
  usersRouter.get("/get_users_data/:email", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { email } = req.params;

        if (email.length >= 3) {
          const GET_USERS_DATA =
            "SELECT u_email FROM users WHERE u_email LIKE ? AND u_is_verified = 1 AND u_is_blocked = 0 AND u_is_deleted = 0 AND users.u_is_verified = 1 AND users.u_is_blocked = 0;";

          pool.query(GET_USERS_DATA, "%" + email + "%", (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong" });
            } else {
              return res.json({ users: result, newToken });
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

exports.searchUsersData = searchUsersData;
