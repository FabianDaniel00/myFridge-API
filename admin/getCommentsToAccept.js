const getCommentsToAccept = (adminRouter, pool, verifyJWT) => {
  adminRouter.get("/get_comments_to_accept", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const GET_COMMENTS_TO_ACCEPT = `SELECT
            r_comments.r_comment_id,
            r_comments.r_comment,
            users.u_f_name,
            users.u_l_name,
            users.u_email,
            recipes.r_name,
            recipes.r_id
          FROM
            r_comments
          INNER JOIN users ON users.u_id = r_comments.u_id
          INNER JOIN recipes ON recipes.r_id = r_comments.r_id
          WHERE
            r_comments.r_comment_accepted = -1`;

        pool.query(GET_COMMENTS_TO_ACCEPT, (err, result) => {
          if (err) {
            console.log(err.message);
            return res.json({ err: "Something went wrong." });
          } else {
            return res.json({ recipes: result, newToken });
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

exports.getCommentsToAccept = getCommentsToAccept;
