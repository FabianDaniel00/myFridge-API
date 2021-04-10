const logout = (usersRouter) => {
  usersRouter.post("/logout", (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.json({ err: "There is no user signed in." });
    } else {
      res.clearCookie("user");
      console.log(`Successful logout, email: ${user.data.u_email}`);
      return res.json({
        message: `Successful logout, email: ${user.data.u_email}`,
      });
    }
  });
};

exports.logout = logout;
