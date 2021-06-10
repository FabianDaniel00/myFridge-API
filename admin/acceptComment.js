const acceptComment = (adminRouter, pool, verifyJWT) => {
  adminRouter.post("/accept_comment", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const { r_comment_id } = req.body;

        if (!r_comment_id) {
          return res.json({ err: "Missing parameters..." });
        } else {
          const ACCEPT_COMMENT =
            "UPDATE r_comments SET r_comment_accepted = 1 WHERE r_comment_id = ?";

          pool.query(ACCEPT_COMMENT, r_comment_id, (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else if (!result.affectedRows) {
              return res.json({ err: "Something went wrong." });
            } else {
              return res.json({ message: "Successfully accepted!", newToken });
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

exports.acceptComment = acceptComment;
