const getGroceries = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.get(
    "/r/r/get_groceries/:ingredients",
    verifyJWT,
    (req, res) => {
      const user = req.session.user;
      if (user) {
        if (req.u_id === user.data.u_id) {
          const newToken = req.newToken;

          const { ingredients } = req.params;

          const groceries_ = ingredients.split("-");

          let containGroceries = [];
          let notContainGroceries = [];

          for (const grocery of groceries_) {
            if (grocery.charAt(0) === "!") {
              notContainGroceries.push(grocery.slice(1, grocery.length));
            } else {
              containGroceries.push(grocery);
            }
          }
          let containGroceries_ = `g_id = -1`;
          const containGroceriesLength = containGroceries.length;
          for (let i = 0; i < containGroceriesLength; i++) {
            if (i === 0) {
              containGroceries_ = `g_id = ` + containGroceries[i];
            } else {
              containGroceries_ += ` OR g_id = ` + containGroceries[i];
            }
          }

          const GET_CONTAIN_GROCERIES = `
            SELECT g_id, g_name, g_img FROM groceries WHERE ${containGroceries_};
          `;

          pool.query(GET_CONTAIN_GROCERIES, (cGErr, cGResult) => {
            if (cGErr) {
              console.log(cGErr.message);
              return res.json({
                err: "Something went wrong.",
              });
            } else {
              for (const grocery of cGResult) {
                const buf = new Buffer.from(grocery.g_img);
                grocery.g_img = buf.toString("base64");
              }

              let notContainGroceries_ = `g_id = -1`;
              const notContainGroceriesLength = notContainGroceries.length;
              for (let i = 0; i < notContainGroceriesLength; i++) {
                if (i === 0) {
                  notContainGroceries_ = `g_id = ` + notContainGroceries[i];
                } else {
                  notContainGroceries_ +=
                    ` OR g_id = ` + notContainGroceries[i];
                }
              }

              const GET_NOT_CONTAIN_GROCERIES = `
                  SELECT g_id, g_name, g_img FROM groceries WHERE ${notContainGroceries_};
                `;

              pool.query(GET_NOT_CONTAIN_GROCERIES, (nCGErr, nCGResult) => {
                if (nCGErr) {
                  console.log(nCGErr.message);
                  return res.json({
                    err: "Something went wrong.",
                  });
                } else {
                  for (const grocery of nCGResult) {
                    const buf = new Buffer.from(grocery.g_img);
                    grocery.g_img = buf.toString("base64");
                  }

                  return res.json({
                    containGroceries: cGResult,
                    notContainGroceries: nCGResult,
                    newToken,
                  });
                }
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
    }
  );
};

exports.getGroceries = getGroceries;
