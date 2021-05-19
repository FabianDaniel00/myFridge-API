const rateRecipe = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.post("/rate_recipe", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;
        const { r_id, rating } = req.body;

        if (!r_id || !rating) {
          return res.json({ err: "Can not be empty data!" });
        } else {
          const CHECK_RATING = `
            SELECT rating
            FROM r_ratings
            WHERE
                r_id = ? AND u_id = ?;
          `;

          pool.query(
            CHECK_RATING,
            [r_id, user.data.u_id],
            (checkErr, checkResult) => {
              if (checkErr) {
                console.log(checkErr.message);
                return res.json({ err: "Something went wrong!" });
              } else if (checkResult.length) {
                const UPDATE_RATING = `
                  UPDATE r_ratings
                  SET rating = ?
                  WHERE
                      r_id = ? AND u_id = ?;
                `;

                pool.query(
                  UPDATE_RATING,
                  [rating, r_id, user.data.u_id],
                  (updateErr, updateResult) => {
                    if (updateErr) {
                      console.log(updateErr);
                      return res.json({ err: "Something went wrong!" });
                    } else if (!updateResult.affectedRows) {
                      return res.json({ err: "Something went wrong!" });
                    } else {
                      return res.json({ message: "Rating updated", newToken });
                    }
                  }
                );
              } else {
                const CREATE_RATING = `
                  INSERT INTO r_ratings (r_id, rating, u_id)
                    VALUES (?, ?, ?);
                `;

                pool.query(
                  CREATE_RATING,
                  [r_id, rating, user.data.u_id],
                  (ratingErr, ratingResult) => {
                    if (ratingErr) {
                      console.log(ratingErr.message);
                      return res.json({ err: "Something went wrong!" });
                    } else if (!ratingResult.affectedRows) {
                      return res.json({ err: "Something went wrong!" });
                    } else {
                      return res.json({
                        message: "Recipe was rated!",
                        newToken,
                      });
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

exports.rateRecipe = rateRecipe;
