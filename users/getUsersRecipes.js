const getUsersRecipes = (usersRouter, pool, verifyJWT) => {
  usersRouter.get("/get_users_recipes", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const GET_USERS_RECIPES = `
          SELECT
              recipes.r_id AS recipe_id,
              recipes.r_name,
              recipes.r_pic,
              recipes.r_description,
              recipes.r_created_at,
              users.u_f_name,
              users.u_l_name,
              r_categories.r_cat_name,
              (
              SELECT
                  SUM(
                      groceries.g_price * ingredients.g_quantity
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
            ) AS ratings_count,
            (
              SELECT
                  COUNT(DISTINCT fav_recipes.r_id)
              FROM
                  fav_recipes
              WHERE
                  r_id = recipe_id AND u_id = ? AND is_favorite = 1
            ) AS is_favorite
            FROM
                recipes
            INNER JOIN users ON users.u_id = recipes.u_id
            INNER JOIN r_categories ON r_categories.r_cat_id = recipes.r_cat_id
            WHERE
                recipes.r_accepted = 1 AND recipes.r_deleted = 0 AND recipes.u_id = ?
            ORDER BY
                r_created_at
            DESC;
        `;
        pool.query(
          GET_USERS_RECIPES,
          [user.data.u_id, user.data.u_id],
          (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else {
              for (const recipe of result) {
                if (recipe.r_pic) {
                  const buf = new Buffer.from(recipe.r_pic);
                  recipe.r_pic = buf.toString("base64");
                }
              }

              return res.json({
                recipes: result,
                newToken,
              });
            }
          }
        );
      } else {
        return res.json({ err: "Something went wrong during authentication." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.getUsersRecipes = getUsersRecipes;
