const getDataForChart = (recipesRouter, pool, verifyJWT) => {
  recipesRouter.get("/r/r/r/get_data_for_chart", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (req.u_id === user.data.u_id) {
        const newToken = req.newToken;

        const GET_DATA_FOR_CHART = `
            SELECT
                groceries.g_name,
                COUNT(used_groceries.g_id) AS grocery_count
            FROM
                used_groceries
            INNER JOIN groceries ON groceries.g_id = used_groceries.g_id
            WHERE
                used_groceries.added_date >= (NOW() - INTERVAL 1 MONTH) AND used_groceries.u_id = ?
            GROUP BY
                groceries.g_name
            ORDER BY grocery_count DESC;
        `;

        pool.query(GET_DATA_FOR_CHART, user.data.u_id, (err, result) => {
          if (err) {
            console.log(err.message);
            return res.json({ err: "Something went wrong." });
          } else {
            return res.json({ data: result, newToken });
          }
        });
      } else {
        return res.json({ err: "Something went wrong during authentication." });
      }
    } else {
      return res.json({ err: "There is no user signed in." });
    }
  });
};

exports.getDataForChart = getDataForChart;
