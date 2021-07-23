const getGCategories = (adminRouter, pool, verifyJWT) => {
  adminRouter.get("/get_g_categories", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const GET_G_CATEGORIES =
          "SELECT g_cat_id, g_cat_name FROM g_categories;";

        pool.query(GET_G_CATEGORIES, (err, result) => {
          if (err) {
            console.log(err.message);
            return res.json({ err: "Something went wrong." });
          } else {
            return res.json({ categories: result, newToken });
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
  });
};

exports.getGCategories = getGCategories;
