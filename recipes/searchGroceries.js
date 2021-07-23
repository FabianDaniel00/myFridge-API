const searchGroceries = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.get("/r/r/search_groceries/:input", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;
        const { input } = req.params;

        if (input.length < 2 && /^[a-zA-Z]+$/.test(input)) {
          return res.json({ result: [], newToken });
        } else {
          const SEARCH_GROCERIES = `
            SELECT
                g.g_id,
                g.g_name,
                cat.g_cat_name,
                g_img,
                g_quantity_type
            FROM
                groceries g,
                g_categories cat
            WHERE
                g.g_cat_id = cat.g_cat_id AND g.g_name LIKE ? AND g.g_is_deleted = 0
            GROUP BY
                g.g_id
          `;

          pool.query(SEARCH_GROCERIES, "%" + input + "%", (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else {
              for (const grocery of result) {
                const buf = new Buffer.from(grocery.g_img);
                grocery.g_img = buf.toString("base64");
              }

              return res.json({ result, newToken });
            }
          });
        }
      } else {
        return res.json({ err: "Something went wrong during authentication." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.searchGroceries = searchGroceries;
