const getRatingData = (recipesRouter, pool) => {
  recipesRouter.get("/r/r/rating_data/:r_id", (req, res) => {
    const { r_id } = req.params;

    if (!r_id) {
      return res.json({ err: "There is no id!" });
    } else {
      const GET_RATING_DATA = `
          SELECT
            (
                SELECT
                    AVG(r_ratings.rating)
                FROM
                    recipes
                INNER JOIN r_ratings ON r_ratings.r_id = recipes.r_id
                WHERE
                    recipes.r_id = ?
            ) AS rating,
            (
                SELECT
                    COUNT(r_ratings.r_id)
                FROM
                    recipes
                INNER JOIN r_ratings ON r_ratings.r_id = recipes.r_id
                WHERE
                    recipes.r_id = ?
            ) AS ratings_count
            FROM
                recipes
            WHERE
                recipes.r_id = ?;
      `;

      pool.query(GET_RATING_DATA, [r_id, r_id, r_id], (err, result) => {
        if (err) {
          console.log(err.message);
          return res.json({ err: "Something went wrong!" });
        } else if (!result.length) {
          return res.json({ err: "There is no recipe with this ID!" });
        } else {
          return res.json({
            rating: result[0].rating,
            ratings_count: result[0].ratings_count,
          });
        }
      });
    }
  });
};

exports.getRatingData = getRatingData;
