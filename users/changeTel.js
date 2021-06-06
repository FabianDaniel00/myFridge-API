const changeTel = (usersRouter, pool, verifyJWT) => {
  usersRouter.post("/edit_tel", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { tel } = req.body;

        const validPhone =
          /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(
            tel
          );

        if (!tel) {
          return res.json({ err: "Please fill out all the fields!" });
        } else if (!validPhone) {
          return res.json({ err: "Not valid phone!" });
        } else {
          const CHANGE_TEL =
            "UPDATE users SET u_tel = ? WHERE u_id = ? AND u_email = ?;";
          pool.query(
            CHANGE_TEL,
            [tel, user.data.u_id, user.data.u_email],
            (err, result) => {
              if (err) {
                console.log(err.message);
                return res.json({ err: "Something went wrong." });
              } else if (!result.affectedRows) {
                return res.json({ err: "Something went wrong." });
              } else {
                user.data.u_tel = tel;
                return res.json({
                  message: "Success Phone number change!",
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

exports.changeTel = changeTel;
