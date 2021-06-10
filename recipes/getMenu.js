const getMenu = (usersRouter, pool, verifyJWT) => {
  usersRouter.get("/r/r/r/get_menu", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const GET_MENU = `
          SELECT
            menus.day,
            menus.r_id,
            recipes.r_pic,
            recipes.r_name,
            r_categories.r_cat_name
          FROM
            menus
          INNER JOIN recipes ON recipes.r_id = menus.r_id
          INNER JOIN r_categories ON r_categories.r_cat_id = recipes.r_cat_id
          WHERE
            menus.u_id = ? AND recipes.r_accepted = 1 AND recipes.r_deleted = 0 AND menus.is_active = 1;
        `;
        pool.query(GET_MENU, user.data.u_id, (err, result) => {
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

            return res.json({ recipes: result, newToken });
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

exports.getMenu = getMenu;
