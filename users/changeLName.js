const changeLName = (usersRouter, pool, verifyJWT) => {
  usersRouter.post("/edit_l_name", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { lName } = req.body;
        const monogram = user.data.u_monogram[0] + lName[0];

        if (!lName) {
          return res.json({ err: "Please fill out all the fields!" });
        } else {
          const CHANGE_L_NAME =
            "UPDATE users SET u_l_name = ?, u_monogram = ? WHERE u_id = ? AND u_email = ?;";
          pool.query(
            CHANGE_L_NAME,
            [lName, monogram, user.data.u_id, user.data.u_email],
            (err, result) => {
              if (err) {
                console.log(err.message);
                return res.json({ err: "Something went wrong." });
              } else if (!result.affectedRows) {
                return res.json({ err: "Something went wrong." });
              } else {
                user.data.u_l_name = lName;
                user.data.u_monogram = monogram;
                return res.json({
                  message: "Success Last Name change!",
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

exports.changeLName = changeLName;
