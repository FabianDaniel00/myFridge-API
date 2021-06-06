const moment = require("moment");

const addComment = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.post("/add_comment", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;
        const { comment, r_comment_id, r_id, u_id } = req.body;

        const CHECK_IS_COMMENTED =
          "SELECT r_comment_id FROM r_comments WHERE r_id = ? AND u_id = ? AND r_comment_deleted = 0;";
        pool.query(CHECK_IS_COMMENTED, [r_id, u_id], (cErr, cResult) => {
          if (cErr) {
            console.log(cErr.message);
          } else if (cResult.length) {
            return res.json({ err: "You already commented on this recipe!" });
          } else {
            if (!comment || !r_comment_id || !r_id || !u_id) {
              return res.json({ err: "Can not be empty data!" });
            } else {
              const ADD_COMMENT =
                "INSERT INTO r_comments (r_comment_id, r_comment, r_id, u_id, r_comment_created_at, r_comment_modified_at, r_comment_deleted) VALUES (?, ?, ?, ?, ?, ?, ?);";
              pool.query(
                ADD_COMMENT,
                [
                  r_comment_id,
                  comment,
                  r_id,
                  u_id,
                  moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                  moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                  0,
                ],
                (err, result) => {
                  if (err) {
                    console.log(err.message);
                    return res.json({ err: "Something went wrong." });
                  } else if (!result.affectedRows) {
                    return res.json({ err: "Something went wrong." });
                  } else {
                    return res.json({
                      message: "Comment submitted.",
                      newToken,
                    });
                  }
                }
              );
            }
          }
        });
      } else {
        return res.json({ err: "Something went wrong during authentication." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.addComment = addComment;
