const removeFromWeeklyMenu = (usersRouter, pool, verifyJWT) => {
  usersRouter.post("/remove_from_weekly_menu", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { r_id, day } = req.body;

        if (!r_id || !day) {
          return res.json({ err: "Missing parameters..." });
        } else {
          const REMOVE_FROM_WEEKLY_MENU =
            "UPDATE menus SET is_active = 0 WHERE u_id = ? AND day = ? AND r_id = ?;";
          pool.query(
            REMOVE_FROM_WEEKLY_MENU,
            [user.data.u_id, day, r_id],
            (err, result) => {
              if (err) {
                console.log(err.message);
                return res.json({ err: "Something went wrong." });
              } else if (!result.affectedRows) {
                return res.json({ err: "Something went wrong." });
              } else {
                return res.json({ removed: true, newToken });
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

exports.removeFromWeeklyMenu = removeFromWeeklyMenu;
