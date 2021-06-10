const unBlockUser = (adminRouter, pool, verifyJWT) => {
  adminRouter.post("/unblock_user", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const { u_id } = req.body;

        if (!u_id) {
          return res.json({ err: "Missing parameters..." });
        } else {
          const BLOCK_USER = "UPDATE users SET u_is_blocked = 0 WHERE u_id = ?";

          pool.query(BLOCK_USER, u_id, (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else if (!result.affectedRows) {
              return res.json({ err: "Something went wrong." });
            } else {
              return res.json({ message: "User unblocked!", newToken });
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

exports.unBlockUser = unBlockUser;
