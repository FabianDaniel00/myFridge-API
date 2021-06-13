const addToUsedGroceries = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.post("/update_fridge", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { containGroceries, notContainGroceries } = req.body;

        const groceriesToAdd = [];
        for (const grocery of containGroceries) {
          const temp = [];
          temp.push(user.data.u_id);
          temp.push(grocery.g_id);
          groceriesToAdd.push(temp);
        }

        if (containGroceries.length) {
          const ADD_TO_USED_GROCERIES =
            "INSERT INTO used_groceries (u_id, g_id) VALUES ?";
          pool.query(ADD_TO_USED_GROCERIES, [groceriesToAdd], (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong" });
            } else if (!result.affectedRows) {
              return res.json({ err: "Something went wrong" });
            } else {
              const DELETE_FROM_MY_FRIDGE =
                "DELETE FROM my_fridge WHERE u_id = ?;";
              pool.query(
                DELETE_FROM_MY_FRIDGE,
                user.data.u_id,
                (dErr, dResult) => {
                  if (dErr) {
                    console.log(dErr.message);
                    return res.json({ err: "Something went wrong" });
                  } else {
                    const groceriesToAdd_ = [];
                    for (const grocery of containGroceries) {
                      const temp = [];
                      temp.push(user.data.u_id);
                      temp.push(grocery.g_id);
                      temp.push(1);
                      groceriesToAdd_.push(temp);
                    }
                    for (const grocery of notContainGroceries) {
                      const temp = [];
                      temp.push(user.data.u_id);
                      temp.push(grocery.g_id);
                      temp.push(0);
                      groceriesToAdd_.push(temp);
                    }

                    const INSERT_INTO_MY_FRIDGE =
                      "INSERT INTO my_fridge (u_id, g_id, include) VALUES ?;";
                    pool.query(
                      INSERT_INTO_MY_FRIDGE,
                      [groceriesToAdd_],
                      (iErr, iResult) => {
                        if (iErr) {
                          console.log(iErr);
                          return res.json({ err: "Something went wrong" });
                        } else if (!iResult.affectedRows) {
                          return res.json({ err: "Something went wrong" });
                        } else {
                          return res.json({
                            message: "Fridge updated!",
                            newToken,
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          });
        } else {
          return res.json({ err: "There is nothing to add." });
        }
      } else {
        return res.json({ err: "Something went wrong during authentication." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.addToUsedGroceries = addToUsedGroceries;
