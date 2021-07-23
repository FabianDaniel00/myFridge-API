const getGroceries = (adminRouter, pool, verifyJWT) => {
  adminRouter.get("/get_groceries/:search", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const { search } = req.params;

        if (!search) {
          return res.json({ err: "Missing parameters..." });
        } else {
          const GET_GROCERIES = `
            SELECT
                groceries.g_id,
                groceries.g_name,
                g_categories.g_cat_name,
                groceries.g_cat_id,
                groceries.g_price,
                groceries.g_quantity_type,
                groceries.g_img,
                groceries.warranty_day
            FROM
                groceries
            INNER JOIN g_categories ON g_categories.g_cat_id = groceries.g_cat_id
            WHERE groceries.g_is_deleted = 0
                ${
                  search === `all`
                    ? ``
                    : ` AND groceries.g_name LIKE '%${search}%'`
                }
            ORDER BY groceries.g_name ASC`;

          pool.query(GET_GROCERIES, (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else {
              for (const grocery of result) {
                const buf = new Buffer.from(grocery.g_img);
                grocery.g_img = buf.toString("base64");
              }

              return res.json({ groceries: result, newToken });
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
  });
};

exports.getGroceries = getGroceries;
