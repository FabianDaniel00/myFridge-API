const getRecipesCategories = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.get("/get/recipes_categories", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const GET_RECIPES_CATEGORIES = `
            SELECT
                r_cat_id, r_cat_name
            FROM
                r_categories
          `;

        pool.query(GET_RECIPES_CATEGORIES, (err, result) => {
          if (err) {
            console.log(err.message);
            return res.json({ err: "Something went wrong." });
          } else {
            return res.json({ result, newToken });
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

exports.getRecipesCategories = getRecipesCategories;
