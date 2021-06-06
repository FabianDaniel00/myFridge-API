const changeFName = (usersRouter, pool, verifyJWT) => {
  usersRouter.post("/edit_f_name", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { fName } = req.body;
        const monogram = fName[0] + user.data.u_monogram[1];

        if (!fName) {
          return res.json({ err: "Please fill out all the fields!" });
        } else {
          const CHANGE_F_NAME =
            "UPDATE users SET u_f_name = ?, u_monogram = ? WHERE u_id = ? AND u_email = ?;";
          pool.query(
            CHANGE_F_NAME,
            [fName, monogram, user.data.u_id, user.data.u_email],
            (err, result) => {
              if (err) {
                console.log(err.message);
                return res.json({ err: "Something went wrong." });
              } else if (!result.affectedRows) {
                return res.json({ err: "Something went wrong." });
              } else {
                user.data.u_f_name = fName;
                user.data.u_monogram = monogram;
                return res.json({
                  message: "Success First Name change!",
                  newToken,
                });
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

exports.changeFName = changeFName;
