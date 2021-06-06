const getRecipesCategories = (recipesRouter, pool) => {
  recipesRouter.get("/r/r/get/recipes_categories", (req, res) => {
    const GET_RECIPES_CATEGORIES = "SELECT * FROM r_categories";

    pool.query(GET_RECIPES_CATEGORIES, (err, result) => {
      if (err) {
        console.log(err.message);
        return res.json({ err: "Something went wrong." });
      } else {
        for (const recipeCategory of result) {
          const buf = new Buffer.from(recipeCategory.r_cat_image);
          recipeCategory.r_cat_image = buf.toString("base64");
        }

        return res.json({ result });
      }
    });
  });
};

exports.getRecipesCategories = getRecipesCategories;
