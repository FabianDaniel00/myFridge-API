const getGroceries = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.get("/r/r/r/get_groceries", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const GET_CONTAIN_GROCERIES = `
            SELECT
                my_fridge.g_id,
                groceries.g_name,
                groceries.g_img,
                my_fridge.include
            FROM
                my_fridge
            INNER JOIN groceries ON groceries.g_id = my_fridge.g_id
            WHERE
                my_fridge.u_id = ?;
          `;

        pool.query(GET_CONTAIN_GROCERIES, user.data.u_id, (err, result) => {
          if (err) {
            console.log(err.message);
            return res.json({
              err: "Something went wrong.",
            });
          } else {
            const containGroceries = [];
            const notContainGroceries = [];
            let groceries = "";

            for (const grocery of result) {
              const buf = new Buffer.from(grocery.g_img);
              grocery.g_img = buf.toString("base64");

              if (grocery.include) {
                containGroceries.push(grocery);
                groceries += grocery.g_id + "-";
              } else {
                notContainGroceries.push(grocery);
                groceries += "!" + grocery.g_id + "-";
              }
            }

            return res.json({
              containGroceries,
              notContainGroceries,
              groceries: groceries.slice(0, groceries.length - 1),
              newToken,
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
  });
};

exports.getGroceries = getGroceries;
