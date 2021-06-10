const getRecipe = (recipesRouter, pool) => {
  recipesRouter.get("/r/r/recipe/:r_id", (req, res) => {
    const { r_id } = req.params;

    if (!r_id) {
      return res.json({ err: "There is no id!" });
    } else {
      const GET_RECIPE = `
          SELECT
                recipes.r_id,
                recipes.r_name,
                recipes.r_pic,
                recipes.r_description,
                r_categories.r_cat_name,
                users.u_f_name,
                users.u_l_name,
                users.u_monogram,
                recipes.r_created_at,
                recipes.r_accepted,
                users.u_email,
                (
                SELECT
                    SUM(
                        groceries.g_price * IF(groceries.g_quantity_type = 'g', ingredients.g_quantity / 1000, ingredients.g_quantity)
                    )
                FROM
                    recipes
                INNER JOIN ingredients ON ingredients.r_id = recipes.r_id
                INNER JOIN groceries ON groceries.g_id = ingredients.g_id
                WHERE
                    recipes.r_id = ? AND recipes.r_deleted = 0
            ) AS price,
            (
              SELECT
                  COUNT(DISTINCT fav_recipes.r_id)
              FROM
                  fav_recipes
              WHERE
                  r_id = ? AND u_id = ? AND is_favorite = 1
            ) AS is_favorite
            FROM
                recipes
            INNER JOIN r_categories ON r_categories.r_cat_id = recipes.r_cat_id
            INNER JOIN users ON users.u_id = recipes.u_id
            WHERE
                recipes.r_id = ?;
      `;

      pool.query(
        GET_RECIPE,
        [r_id, r_id, req.session.user ? req.session.user.data.u_id : 0, r_id],
        (rErr, rResult) => {
          if (rErr) {
            console.log(rErr.message);
            return res.json({ err: "Something went wrong!" });
          } else if (!rResult.length) {
            return res.json({ err: "There is no recipe with this ID!" });
          } else {
            const GET_INGREDIENTS = `
          SELECT
              ingredients.g_id,
              groceries.g_name,
              ingredients.g_quantity,
              groceries.g_quantity_type,
              (
                  groceries.g_price * IF(groceries.g_quantity_type = 'g', ingredients.g_quantity / 1000, ingredients.g_quantity)
              ) AS i_price
          FROM
              ingredients
          INNER JOIN groceries ON groceries.g_id = ingredients.g_id
          WHERE
              ingredients.r_id = ?;
      `;

            pool.query(GET_INGREDIENTS, r_id, (iErr, iResult) => {
              if (iErr) {
                console.log(iErr.message);
                return res.json({ err: "Something went wrong!" });
              } else if (!iResult.length) {
                return res.json({ err: "Something went wrong!" });
              } else {
                const GET_COMMENTS = `
                  SELECT
                      r_comments.r_comment_id,
                      r_comments.r_comment,
                      r_comments.u_id,
                      users.u_f_name,
                      users.u_l_name,
                      users.u_monogram,
                      r_comments.r_comment_created_at,
                      r_comments.r_comment_modified_at
                  FROM
                      r_comments
                  INNER JOIN users ON users.u_id = r_comments.u_id
                  WHERE
                      r_comments.r_id = ? AND r_comment_deleted = 0 AND r_comment_accepted = 1
                  ORDER BY r_comment_created_at DESC;
                `;

                pool.query(GET_COMMENTS, r_id, (cErr, cResult) => {
                  if (cErr) {
                    console.log(cErr.message);
                    return res.json({ err: "Something went wrong!" });
                  }
                  let rating_by_user = 0;
                  if (req.session.user) {
                    const GET_RATING_BY_USER = `
                  SELECT rating
                  FROM r_ratings
                  WHERE
                      r_id = ? AND u_id = ?;
              `;

                    pool.query(
                      GET_RATING_BY_USER,
                      [r_id, req.session.user.data.u_id],
                      (ratingErr, ratingResult) => {
                        if (ratingErr) {
                          console.log(ratingErr.message);
                          return res.json({ err: "Something went wrong!" });
                        }
                        if (ratingResult.length) {
                          rating_by_user = ratingResult[0].rating;
                        }

                        if (rResult[0].r_pic) {
                          const buf = new Buffer.from(rResult[0].r_pic);
                          rResult[0].r_pic = buf.toString("base64");
                        }

                        return res.json({
                          recipe: {
                            data: rResult[0],
                            ingredients: iResult,
                          },
                          rating_by_user,
                          comments: cResult,
                        });
                      }
                    );
                  } else {
                    if (rResult[0].r_pic) {
                      const buf = new Buffer.from(rResult[0].r_pic);
                      rResult[0].r_pic = buf.toString("base64");
                    }

                    return res.json({
                      recipe: {
                        data: rResult[0],
                        ingredients: iResult,
                      },
                      rating_by_user,
                      comments: cResult,
                    });
                  }
                });
              }
            });
          }
        }
      );
    }
  });
};

exports.getRecipe = getRecipe;
