const logout = (usersRouter) => {
  usersRouter.post("/logout", (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.json({ err: "There is no user signed in." });
    } else {
      try {
        res.clearCookie("user");
        console.log(`Successful logout, email: ${user.data.u_email}`);
        return res.json({
          message: `Successful logout, email: ${user.data.u_email}`,
        });
      } catch (err) {
        console.log(err.message);
        return res.json({
          err: `Something went wrong during login.`,
        });
      }
    }
  });
};

exports.logout = logout;
