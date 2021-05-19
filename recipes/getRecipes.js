const getRecipes = (recipesRouter, pool) => {
  recipesRouter.get("/:page", (req, res) => {
    const { page } = req.params;

    if (!page || isNaN(parseInt(page))) {
      return res.json({ err: "Select a page for get the recipes!" });
    } else {
      const GET_RECIPES_COUNT =
        "SELECT COUNT(r_id) AS recipes_count FROM recipes WHERE recipes.r_accepted = 1 AND recipes.r_deleted = 0";

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
        ) AS ratings_count
          FROM
              recipes
          INNER JOIN users ON users.u_id = recipes.u_id
          INNER JOIN r_categories ON r_categories.r_cat_id = recipes.r_cat_id
          WHERE
              recipes.r_accepted = 1 AND recipes.r_deleted = 0
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
                return res.json({
                  err: "There is no data in database on this page!",
                });
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
                });
              }
            }
          );
        }
      });
    }
  });
};

exports.getRecipes = getRecipes;
