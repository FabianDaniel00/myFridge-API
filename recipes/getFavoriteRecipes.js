const getFavoriteRecipes = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.get("/r/r/r/get_favorite_recipes", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const GET_FAVORITE_RECIPES = `
          SELECT
              fav_recipes.r_id AS recipe_id,
              recipes.r_name,
              recipes.r_pic,
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
                    fav_recipes
                INNER JOIN recipes ON recipes.r_id = fav_recipes.r_id
                INNER JOIN users ON users.u_id = recipes.u_id
                INNER JOIN r_categories ON r_categories.r_cat_id = recipes.r_cat_id
                WHERE
                    recipes.r_accepted = 1 AND recipes.r_deleted = 0 AND fav_recipes.is_favorite = 1 AND fav_recipes.u_id = ?
                ORDER BY
                    added_date
                DESC
        `;

        pool.query(GET_FAVORITE_RECIPES, user.data.u_id, (err, result) => {
          if (err) {
            console.log(err.message);
            return res.json({ err: "Something went wrong" });
          } else {
            for (const favoriteRecipe of result) {
              if (favoriteRecipe.r_pic) {
                const buf = new Buffer.from(favoriteRecipe.r_pic);
                favoriteRecipe.r_pic = buf.toString("base64");
              }
            }

            const GET_DAYS_FROM_WEEKLY_MENU = `
              SELECT
                  day, r_id
              FROM
                  menus
              WHERE is_active = 1 AND u_id = ?
            `;
            pool.query(
              GET_DAYS_FROM_WEEKLY_MENU,
              user.data.u_id,
              (dErr, dResult) => {
                if (dErr) {
                  console.log(dErr.message);
                  return res.json({ err: "Something went wrong" });
                } else {
                  return res.json({
                    favoriteRecipes: result,
                    daysFromWeeklyMenu: dResult,
                    newToken,
                  });
                }
              }
            );
          }
        });
      } else {
        return res.json({ err: "Something went wrong during authentication." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.getFavoriteRecipes = getFavoriteRecipes;
