const myFridge = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.get(
    "/r/r/my_fridge/:page/:groceries",
    verifyJWT,
    (req, res) => {
      const user = req.session.user;
      if (user) {
        if (req.u_id === user.data.u_id) {
          const newToken = req.newToken;

          const { groceries, page } = req.params;

          const groceries_ = groceries.split("-");

          const containGroceries = [];
          const notContainGroceries = [];

          for (const grocery of groceries_) {
            if (grocery.charAt(0) === "!") {
              notContainGroceries.push(grocery.slice(1, grocery.length));
            } else {
              containGroceries.push(grocery);
            }
          }

          if (!containGroceries.length && !notContainGroceries.length) {
            return res.json({ err: "Please select at least one grocery!" });
          } else {
            let groceriesToContainQuery = ``;
            let groceriesToNotContainQuery = ``;

            for (const containGrocery of containGroceries) {
              groceriesToContainQuery += `
                AND EXISTS(
                    SELECT
                        ingredients.g_id
                    FROM
                        ingredients
                    WHERE
                        ingredients.r_id = recipes.r_id AND ingredients.g_id = ${containGrocery}
                )
              `;
            }

            for (const notContainGrocery of notContainGroceries) {
              groceriesToNotContainQuery += `
                AND NOT EXISTS(
                    SELECT
                        ingredients.g_id
                    FROM
                        ingredients
                    WHERE
                        ingredients.r_id = recipes.r_id AND ingredients.g_id = ${notContainGrocery}
                )
              `;
            }

            const GET_RECIPES_COUNT = `
              SELECT
                  COUNT(recipes.r_id) AS recipes_count
              FROM
                  recipes
              WHERE
                  recipes.r_accepted = 1 AND recipes.r_deleted = 0
                  ${groceriesToContainQuery}
                  ${groceriesToNotContainQuery};
            `;

            pool.query(GET_RECIPES_COUNT, async (err, result) => {
              if (err) {
                console.log(err.message);
                return res.json({
                  err: "Something went wrong during fetching the recipes",
                });
              } else if (!result.length) {
                return res.json({
                  err: "There is no recipe in the database",
                });
              } else {
                const GET_RECIPES_BY_PAGE = `
                  SELECT
                      recipes.r_id AS recipe_id,
                      recipes.r_name,
                      recipes.r_pic,
                      recipes.r_description,
                      recipes.r_accepted,
                      recipes.r_created_at,
                      users.u_f_name,
                      users.u_l_name,
                      r_categories.r_cat_name,
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
                          recipes.r_id = recipe_id AND recipes.r_accepted = 1 AND recipes.r_deleted = 0
                      ) AS price,
                      (
                        SELECT
                            AVG(r_ratings.rating)
                        FROM
                            recipes
                        INNER JOIN r_ratings ON r_ratings.r_id = recipes.r_id
                        WHERE
                            recipes.r_id = recipe_id AND recipes.r_accepted = 1 AND recipes.r_deleted = 0
                    ) AS rating,
                    (
                        SELECT
                            COUNT(r_ratings.r_id)
                        FROM
                            recipes
                        INNER JOIN r_ratings ON r_ratings.r_id = recipes.r_id
                        WHERE
                            recipes.r_id = recipe_id AND recipes.r_accepted = 1 AND recipes.r_deleted = 0
                    ) AS ratings_count
                      FROM
                          recipes
                      INNER JOIN users ON users.u_id = recipes.u_id
                      INNER JOIN r_categories ON r_categories.r_cat_id = recipes.r_cat_id
                      WHERE
                          recipes.r_accepted = 1 AND recipes.r_deleted = 0
                          ${groceriesToContainQuery}
                          ${groceriesToNotContainQuery}
                      ORDER BY
                          rating
                      DESC
                      LIMIT ? OFFSET ?;
                `;

                await pool.query(
                  GET_RECIPES_BY_PAGE,
                  [10, (page - 1) * 10],
                  (byPageErr, byPageResult) => {
                    if (byPageErr) {
                      console.log(byPageErr.message);
                      return res.json({
                        err: "Something went wrong during fetching the recipes",
                      });
                    } else if (!byPageResult.length) {
                      return res.json({ err: "There is no recipes found!" });
                    } else {
                      for (const recipe of byPageResult) {
                        if (recipe.r_pic) {
                          const buf = new Buffer.from(recipe.r_pic);
                          recipe.r_pic = buf.toString("base64");
                        }
                      }

                      return res.json({
                        recipes: byPageResult,
                        recipesCount: result[0].recipes_count,
                        newToken,
                      });
                    }
                  }
                );
              }
            });
          }
        } else {
          return res.json({
            err: "Something went wrong during authentication.",
          });
        }
      } else {
        return res.json({ err: "There is no user signed in." });
      }
    }
  );
};

exports.myFridge = myFridge;
