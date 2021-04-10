const registerVerification = (usersRouter, pool) => {
  usersRouter.post("/register_verification", (req, res) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.json({ err: "Can not be empty data!" });
    } else {
      const VERIFY_USER =
        "UPDATE users SET u_is_verified = ?, verification_code = ? WHERE u_email = ? AND verification_code = ?";

      pool.query(
        VERIFY_USER,
        [true, null, email, verificationCode],
        (err, result) => {
          if (err) {
            console.log(err.message);
            return res.json({
              err: "Something went wrong during verification.",
            });
          } else if (!result.changedRows) {
            return res.json({ err: "The code or the email was incorrect!" });
          } else {
            console.log(`User was verified, email: ${email}`);
            return res.json({
              message: `User was successfully verified, email: ${email}`,
            });
          }
        }
      );
    }
  });
};

exports.registerVerification = registerVerification;
