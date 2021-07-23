const addGrocery = (adminRouter, pool, verifyJWT) => {
  adminRouter.post("/add_grocery", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const {
          g_img,
          g_name,
          g_cat_id,
          g_price,
          g_quantity_type,
          warranty_day,
        } = req.body;

        let buffer = null;
        let contentType = "";
        let picSize = 0;

        if (g_img) {
          const parts = g_img.split(";base64,");
          contentType = parts[0].slice(5);
          try {
            buffer = Buffer.from(parts[1], "base64");
            picSize = Buffer.byteLength(buffer);
          } catch (error) {
            return res.json({ err: "Something went wrong." });
          }
        }

        if (
          !g_name ||
          g_cat_id === -1 ||
          g_cat_id === "" ||
          g_price === "" ||
          !g_quantity_type ||
          warranty_day === "" ||
          !g_img
        ) {
          return res.json({ err: "Missing parameters..." });
        } else if (
          Math.round(picSize / 1024) >= 1024 &&
          (contentType !== "image/png" ||
            contentType !== "image/jpeg" ||
            contentType !== "image/jpg")
        ) {
          return res.json({
            err: "Picture is to large or it is not a picture!",
          });
        } else {
          const ADD_GROCERY = `
            INSERT INTO
                groceries
                (g_name, g_cat_id, g_price, g_quantity_type, g_img, warranty_day, g_is_deleted)
            VALUES
                (?, ?, ?, ?, ?, ?, ?);
          `;

          pool.query(
            ADD_GROCERY,
            [
              g_name,
              g_cat_id,
              g_price,
              g_quantity_type,
              buffer,
              warranty_day,
              0,
            ],
            (err, result) => {
              if (err) {
                console.log(err.message);
                return res.json({ err: "Something went wrong." });
              } else {
                return res.json({
                  g_id: result.insertId,
                  message: "Grocery successfully added!",
                  newToken,
                });
              }
            }
          );
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

exports.addGrocery = addGrocery;
