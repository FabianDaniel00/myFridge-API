const removeFromWeeklyMenu = (usersRouter, pool, verifyJWT) => {
  usersRouter.post("/remove_from_weekly_menu", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { m_id } = req.body;

        if (!m_id) {
          return res.json({ err: "m_is is missing..." });
        } else {
          const REMOVE_FROM_WEEKLY_MENU = "DELETE FROM menus WHERE m_id = ?;";
          pool.query(REMOVE_FROM_WEEKLY_MENU, m_id, (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else if (!result.affectedRows) {
              return res.json({ err: "Something went wrong." });
            } else {
              return res.json({ removed: true, newToken });
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

exports.removeFromWeeklyMenu = removeFromWeeklyMenu;
