const addToWeeklyMenu = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.post("/add_to_weekly_menu", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { r_id, day } = req.body;

        if (
          !r_id ||
          day === null ||
          day === undefined ||
          day === "" ||
          parseInt(day) === NaN
        ) {
          return res.json({ err: "Missing parameters..." });
        } else {
          const CHECK_DAY =
            "SELECT day FROM menus WHERE u_id = ? AND day = ? AND r_id = ? AND is_active = 1";
          pool.query(
            CHECK_DAY,
            [user.data.u_id, day, r_id],
            (cErr, cResult) => {
              if (cErr) {
                console.log(cErr.message);
                return res.json({ err: "Something went wrong." });
              } else if (cResult.length) {
                return res.json({
                  err: "You already added this recipe on that day",
                });
              } else {
                const UPDATE_MENUS =
                  "UPDATE menus SET is_active = 1 WHERE u_id = ? AND day = ? AND r_id = ?;";
                pool.query(
                  UPDATE_MENUS,
                  [user.data.u_id, day, r_id],
                  (uErr, uResult) => {
                    if (uErr) {
                      console.log(uErr.message);
                      return res.json({ err: "Something went wrong." });
                    } else if (uResult.affectedRows) {
                      return res.json({
                        message: "Successfully added to weekly menu.",
                        newToken,
                      });
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
                  }
                );
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
