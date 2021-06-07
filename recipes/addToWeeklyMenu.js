const addToWeeklyMenu = (usersRouter, pool, verifyJWT) => {
  usersRouter.post("/add_to_weekly_menu", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { r_id, day } = req.body;

        if (!r_id || !day) {
          return res.json({ err: "Missing parameters..." });
        } else {
          const ADD_TO_MENU =
            "INSERT INTO menus (u_id, day, r_id) VALUES (?, ?, ?);";
          pool.query(
            ADD_TO_MENU,
            [user.data.u_id, day, r_id],
            (err, result) => {
              if (err) {
                console.log(err.message);
                return res.json({ err: "Something went wrong." });
              } else if (!result.affectedRows) {
                return res.json({ err: "Something went wrong." });
              } else {
                return res.json({
                  message: "Successfully added to weekly menu.",
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

exports.addToWeeklyMenu = addToWeeklyMenu;
