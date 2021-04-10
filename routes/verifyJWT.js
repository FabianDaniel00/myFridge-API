const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.json({ err: "There is no token..." });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log(err.message);
        const refreshToken = req.session.user.refreshToken;
        if (!refreshToken) {
          return res.json({ err: "There is no refresh token..." });
        } else {
          jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH,
            (refreshErr, refreshDecoded) => {
              if (refreshErr) {
                return res.json({
                  err: "Please re-login to continue to use the application.",
                });
              } else {
                if (req.session.user.data.u_id === refreshDecoded.u_id) {
                  const newToken = jwt.sign(
                    { u_id: refreshDecoded.u_id },
                    process.env.JWT_SECRET,
                    {
                      expiresIn: 300,
                    }
                  );
                  req.newToken = newToken;
                  req.u_id = refreshDecoded.u_id;
                  return next();
                } else {
                  return res.json({
                    err: "Something went wrong during authentication.",
                  });
                }
              }
            }
          );
        }
      } else {
        req.newToken = "";
        req.u_id = decoded.u_id;
        return next();
      }
    });
  }
};

exports.verifyJWT = verifyJWT;
