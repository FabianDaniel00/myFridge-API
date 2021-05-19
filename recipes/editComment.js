const moment = require("moment");

const editComment = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.put("/edit_comment", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;
        const { r_comment_id, r_comment } = req.body;

        if (!r_comment_id || !r_comment) {
          return res.json({ err: "Can not be empty data!" });
        } else {
          const EDIT_COMMENT =
            "UPDATE r_comments SET r_comment = ?, r_comment_modified_at = ? WHERE r_comment_id = ?";

          pool.query(
            EDIT_COMMENT,
            [
              r_comment,
              moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
              r_comment_id,
            ],
            (err, result) => {
              if (err) {
                console.log(err.message);
                return res.json({ err: "Something went wrong." });
              } else if (!result.affectedRows) {
                return res.json({ err: "Something went wrong." });
              } else {
                return res.json({ message: "Comment edited!", newToken });
              }
            }
          );
        }
      } else {
        return res.json({ err: "Something went wrong during authentication." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.editComment = editComment;
