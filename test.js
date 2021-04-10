const test = (testRouter, verifyJWT) => {
  testRouter.get("/", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;
        if (newToken) {
          return res.json({ user: user.data, newToken: newToken });
        } else {
          return res.json({ user: user.data });
        }
      } else {
        return res.json({ err: "Something went wrong." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.test = test;
