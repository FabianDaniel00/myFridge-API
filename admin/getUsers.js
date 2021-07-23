const getUsers = (adminRouter, pool, verifyJWT) => {
  adminRouter.get("/get_users/:search", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const { search } = req.params;

        if (!search) {
          return res.json({ err: "Missing parameters..." });
        } else {
          const GET_USERS = `
            SELECT
                u_id, u_f_name, u_l_name, u_email, u_tel, u_is_verified, u_is_blocked, u_is_admin
            FROM
                users
            WHERE
                u_is_deleted = 0 AND
                u_email != ?
                ${
                  search === `all`
                    ? ``
                    : `AND (u_email LIKE '%${search}%' OR CONCAT(u_f_name, ' ', u_l_name) LIKE '%${search}%')`
                }
            ORDER BY CONCAT(users.u_f_name, ' ', users.u_l_name) ASC`;

          pool.query(GET_USERS, user.data.u_email, (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else {
              return res.json({ users: result, newToken });
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

exports.getUsers = getUsers;
