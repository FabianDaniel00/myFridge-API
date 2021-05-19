const deleteComment = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.put("/delete_comment", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;
        const { r_comment_id } = req.body;

        if (!r_comment_id) {
          return res.json({ err: "There is no comment ID." });
        } else {
          const DELETE_COMMENT =
            "UPDATE r_comments SET r_comment_deleted = ? WHERE r_comment_id = ?";

          pool.query(DELETE_COMMENT, [1, r_comment_id], (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else if (!result.affectedRows) {
              return res.json({ err: "Something went wrong." });
            } else {
              return res.json({ message: "Comment deleted!", newToken });
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

exports.deleteComment = deleteComment;
