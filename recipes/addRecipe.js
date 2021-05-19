const moment = require("moment");

const addRecipe = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.post("/add_recipe", verifyJWT, async (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const { r_id, r_name, r_description, r_cat_id, ingredients, r_pic } =
          req.body;

        let buffer = null;
        let contentType = "";
        let picSize = 0;

        if (r_pic) {
          const parts = r_pic.split(";base64,");
          contentType = parts[0].slice(5);
          try {
            buffer = Buffer.from(parts[1], "base64");
            picSize = Buffer.byteLength(buffer);
          } catch (error) {
            return res.json({ err: "Something went wrong." });
          }
        }

        if (!r_id || !r_name || !r_description || !r_cat_id) {
          return res.json({ err: "Please check out all the fields!" });
        } else if (ingredients.length <= 1) {
          return res.json({ err: "You have to add 2 or more ingredients!" });
        } else if (
          Math.round(picSize / 1024) >= 4096 &&
          (contentType !== "image/png" ||
            contentType !== "image/jpeg" ||
            contentType !== "image/jpg")
        ) {
          return res.json({
            err: "Picture is to large or it is not a picture!",
          });
        } else {
          const ADD_RECIPE = `
            INSERT INTO recipes
              (r_id, r_name, r_pic, r_description, r_accepted, r_cat_id, u_id, r_deleted, r_created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
          `;

          pool.query(
            ADD_RECIPE,
            [
              r_id,
              r_name,
              buffer,
              r_description,
              0,
              r_cat_id,
              user.data.u_id,
              0,
              moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            ],
            (rErr, rResult) => {
              if (rErr) {
                console.log(rErr.message);
                return res.json({ err: "Something went wrong." });
              } else if (!rResult.affectedRows) {
                return res.json({ err: "Something went wrong." });
              } else {
                let ADD_INGREDIENTS =
                  "INSERT INTO ingredients (g_id, r_id, g_quantity) VALUES ?";

                pool.query(ADD_INGREDIENTS, [ingredients], (iErr, iResult) => {
                  if (iErr) {
                    console.log(iErr.message);
                    return res.json({ err: "Something went wrong." });
                  } else if (!iResult.affectedRows) {
                    return res.json({ err: "Something went wrong." });
                  } else {
                    return res.json({
                      message:
                        "Recipe successfully added! Please wait for admin to accept it!",
                      newToken,
                    });
                  }
                });
              }
            }
          );
        }
      } else {
        return res.json({ err: "Something went wrong during authentication." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.addRecipe = addRecipe;
