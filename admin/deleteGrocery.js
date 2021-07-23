const deleteGrocery = (adminRouter, pool, verifyJWT) => {
  adminRouter.post("/delete_grocery", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const { g_id } = req.body;

        if (!g_id) {
          return res.json({ err: "Missing parameters..." });
        } else {
          const DELETE_GROCERY =
            "UPDATE groceries SET g_is_deleted = 1 WHERE g_id = ?";

          pool.query(DELETE_GROCERY, g_id, (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else if (!result.affectedRows) {
              return res.json({ err: "Something went wrong." });
            } else {
              return res.json({
                message: "Grocery successfully deleted!",
                newToken,
              });
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

exports.deleteGrocery = deleteGrocery;
