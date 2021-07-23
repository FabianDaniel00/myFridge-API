const editGrocery = (adminRouter, pool, verifyJWT) => {
  adminRouter.post("/edit_grocery", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const {
          g_id,
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
          !g_id ||
          !g_name ||
          g_cat_id === "" ||
          g_price === "" ||
          !g_quantity_type ||
          warranty_day === ""
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
          const EDIT_GROCERY = `
            UPDATE
                groceries
            SET
                g_name = ?,
                g_cat_id = ?,
                g_price = ?,
                g_quantity_type = ?,
                warranty_day = ?,
                g_img = ?
            WHERE
                g_id = ?
          `;

          pool.query(
            EDIT_GROCERY,
            [
              g_name,
              g_cat_id,
              g_price,
              g_quantity_type,
              warranty_day,
              buffer,
              g_id,
            ],
            (err, result) => {
              if (err) {
                console.log(err.message);
                return res.json({ err: "Something went wrong." });
              } else {
                return res.json({
                  message: "Grocery successfully edited!",
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

exports.editGrocery = editGrocery;
