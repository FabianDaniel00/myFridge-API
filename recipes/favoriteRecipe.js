const favoriteRecipe = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.post("/favorite_recipes", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { r_id } = req.body;

        if (!r_id) {
          return res.json({ err: "Can not be empty data!" });
        } else {
          const UPDATE_FAVORITE_RECIPE =
            "UPDATE fav_recipes SET is_favorite = !is_favorite WHERE r_id = ? AND u_id = ?;";
          pool.query(
            UPDATE_FAVORITE_RECIPE,
            [r_id, user.data.u_id],
            (uErr, uResult) => {
              if (uErr) {
                console.log(uErr.message);
                return res.json({ err: "Something went wrong" });
              } else if (!uResult.affectedRows) {
                const ADD_FAVORITE_RECIPE =
                  "INSERT INTO fav_recipes (u_id, r_id) VALUES (?, ?);";
                pool.query(
                  ADD_FAVORITE_RECIPE,
                  [user.data.u_id, r_id],
                  (iErr, iResult) => {
                    if (iErr) {
                      console.log(iErr.message);
                      return res.json({ err: "Something went wrong" });
                    } else if (!iResult.affectedRows) {
                      return res.json({ err: "Something went wrong" });
                    } else {
                      return res.json({
                        added: true,
                        newToken,
                      });
                    }
                  }
                );
              } else {
                return res.json({
                  updated: true,
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

exports.favoriteRecipe = favoriteRecipe;
