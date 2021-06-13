const myFridge = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.get(
    "/r/r/my_fridge/:page/:groceries/:email",
    verifyJWT,
    (req, res) => {
      const user = req.session.user;
      if (user) {
        if (req.u_id === user.data.u_id) {
          const newToken = req.newToken;

          const { groceries, page, email } = req.params;

          const GET_FRIEND_GROCERIES = `
              SELECT
                  my_fridge.g_id,
                  groceries.g_name,
                  groceries.g_img
              FROM
                  my_fridge
              INNER JOIN users ON users.u_id = my_fridge.u_id
              INNER JOIN groceries ON groceries.g_id = my_fridge.g_id
              WHERE
                  users.u_email = ? AND my_fridge.include = 1 AND users.u_is_deleted = 0 AND users.u_is_verified = 1 AND users.u_is_blocked = 0;
          `;
          pool.query(GET_FRIEND_GROCERIES, email, (fErr, fResult) => {
            if (fErr) {
              console.log(fErr.message);
              return res.json({
                err: "Something went wrong",
              });
            } else {
              const groceries_ = groceries.split("-");

              const containGroceries = [];
              const notContainGroceries = [];

              for (const grocery of fResult) {
                containGroceries.push(String(grocery.g_id));
              }

              for (const grocery of groceries_) {
                if (grocery.charAt(0) === "!") {
                  notContainGroceries.push(grocery.slice(1, grocery.length));
                } else {
                  containGroceries.push(grocery);
                }
              }

              let groceriesToContainQuery = ``;
              let groceriesToNotContainQuery = ``;

              const containGroceriesLength = containGroceries.length;
              for (let i = 0; i < containGroceriesLength; i++) {
                if (i === 0) {
                  groceriesToContainQuery += `ingredients.g_id = ${containGroceries[i]}`;
                } else {
                  groceriesToContainQuery += ` OR ingredients.g_id = ${containGroceries[i]}`;
                }
              }

              const notContainGroceriesLength = notContainGroceries.length;
              for (let i = 0; i < notContainGroceriesLength; i++) {
                if (i === 0) {
                  groceriesToNotContainQuery += `ingredients.g_id = ${notContainGroceries[i]}`;
                } else {
                  groceriesToNotContainQuery += ` OR ingredients.g_id = ${notContainGroceries[i]}`;
                }
              }

              let GET_RECIPES_COUNT = `
                  SELECT
                      COUNT(recipes.r_id) AS recipes_count
                  FROM
                      recipes
                  WHERE
                      recipes.r_accepted = 1 AND recipes.r_deleted = 0 `;
              if (groceriesToContainQuery) {
                GET_RECIPES_COUNT += `
                    AND EXISTS(
                      SELECT
                          ingredients.g_id
                      FROM
                          ingredients
                      WHERE
                          ingredients.r_id = recipes.r_id AND (${groceriesToContainQuery})
                    ) `;
              }
              if (groceriesToNotContainQuery) {
                GET_RECIPES_COUNT += `
                    AND NOT EXISTS(
                      SELECT
                          ingredients.g_id
                      FROM
                          ingredients
                      WHERE
                          ingredients.r_id = recipes.r_id AND (${groceriesToNotContainQuery})
                    )
                  `;
              }

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
                  let GET_RECIPES_BY_PAGE = `
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
                              recipes.r_accepted = 1 AND recipes.r_deleted = 0 `;
                  if (groceriesToContainQuery) {
                    GET_RECIPES_BY_PAGE += `
                        AND EXISTS(
                          SELECT
                              ingredients.g_id
                          FROM
                              ingredients
                          WHERE
                              ingredients.r_id = recipes.r_id AND (${groceriesToContainQuery})
                        ) `;
                  }
                  if (groceriesToNotContainQuery) {
                    GET_RECIPES_BY_PAGE += `
                        AND NOT EXISTS(
                          SELECT
                              ingredients.g_id
                          FROM
                              ingredients
                          WHERE
                              ingredients.r_id = recipes.r_id AND (${groceriesToNotContainQuery})
                        ) `;
                  }
                  GET_RECIPES_BY_PAGE += `
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
                        const DELETE_FROM_FRIDGE =
                          "DELETE FROM my_fridge WHERE u_id = ?;";
                        pool.query(
                          DELETE_FROM_FRIDGE,
                          user.data.u_id,
                          (dErr, dResult) => {
                            if (dErr) {
                              console.log(dErr.message);
                              return res.json({ err: "Something went wrong" });
                            } else {
                              return res.json({
                                err: "There is no recipes found!",
                              });
                            }
                          }
                        );
                      } else {
                        for (const recipe of byPageResult) {
                          if (recipe.r_pic) {
                            const buf = new Buffer.from(recipe.r_pic);
                            recipe.r_pic = buf.toString("base64");
                          }
                        }

                        const DELETE_FROM_FRIDGE_ =
                          "DELETE FROM my_fridge WHERE u_id = ?;";
                        pool.query(
                          DELETE_FROM_FRIDGE_,
                          user.data.u_id,
                          (mErr, mResult) => {
                            if (mErr) {
                              console.log(mErr.message);
                              return res.json({ err: "Something went wrong" });
                            } else {
                              const groceriesToAdd = [];

                              for (const grocery of containGroceries) {
                                const temp = [];
                                temp.push(user.data.u_id);
                                temp.push(parseInt(grocery));
                                temp.push(1);
                                groceriesToAdd.push(temp);
                              }

                              for (const grocery of notContainGroceries) {
                                const temp = [];
                                temp.push(user.data.u_id);
                                temp.push(parseInt(grocery));
                                temp.push(0);
                                groceriesToAdd.push(temp);
                              }
                              for (const grocery of fResult) {
                                const buf = new Buffer.from(grocery.g_img);
                                grocery.g_img = buf.toString("base64");
                              }
                              if (groceriesToAdd.length) {
                                const INSERT_TO_FRIDGE =
                                  "INSERT INTO my_fridge (u_id, g_id, include) VALUES ?;";
                                pool.query(
                                  INSERT_TO_FRIDGE,
                                  [groceriesToAdd],
                                  (iErr, iResult) => {
                                    if (iErr) {
                                      console.log(iErr.message);
                                      return res.json({
                                        err: "Something went wrong",
                                      });
                                    } else if (!iResult.affectedRows) {
                                      return res.json({
                                        err: "Something went wrong",
                                      });
                                    } else {
                                      return res.json({
                                        recipes: byPageResult,
                                        recipesCount: result[0].recipes_count,
                                        newToken,
                                        message: fResult.length
                                          ? "Your recipes includes your friends fridge's content!"
                                          : parseInt(email) !== 0
                                          ? "Your recipes don't includes your friends fridge's content!"
                                          : null,
                                        newGroceries: fResult,
                                      });
                                    }
                                  }
                                );
                              } else {
                                return res.json({
                                  recipes: byPageResult,
                                  recipesCount: result[0].recipes_count,
                                  newToken,
                                  message: fResult.length
                                    ? "Your recipes includes your friends fridge's content!"
                                    : email !== 0
                                    ? "Your recipes don't includes your friends fridge's content!"
                                    : null,
                                  newGroceries: fResult,
                                });
                              }
                            }
                          }
                        );
                      }
                    }
                  );
                }
              });
            }
          });
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
