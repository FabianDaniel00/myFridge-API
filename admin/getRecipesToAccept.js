const getRecipesToAccept = (adminRouter, pool, verifyJWT) => {
  adminRouter.get("/get_recipes_to_accept", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const GET_RECIPES_TO_ACCEPT =
          "SELECT r_name, r_id FROM recipes WHERE r_accepted = -1";

        pool.query(GET_RECIPES_TO_ACCEPT, (err, result) => {
          if (err) {
            console.log(err.message);
            return res.json({ err: "Something went wrong." });
          } else {
            return res.json({ recipes: result, newToken });
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

exports.getRecipesToAccept = getRecipesToAccept;
