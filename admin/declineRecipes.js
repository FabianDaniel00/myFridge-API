const nodemailer = require("nodemailer");
require("dotenv").config();

const declineRecipe = (adminRouter, pool, verifyJWT) => {
  adminRouter.post("/decline_recipe", verifyJWT, (req, res) => {
    const user = req.session.user;
    if (user) {
      if (
        req.u_id === user.data.u_id &&
        req.u_is_admin === user.data.u_is_admin
      ) {
        const newToken = req.newToken;

        const { r_id, r_name, email, fName, lName } = req.body;

        if (!r_id || !r_name || !email || !fName || !lName) {
          return res.json({ err: "Missing parameters..." });
        } else {
          const DECLINE_RECIPE =
            "UPDATE recipes SET r_accepted = 0 WHERE r_id = ?";

          pool.query(DECLINE_RECIPE, r_id, (err, result) => {
            if (err) {
              console.log(err.message);
              return res.json({ err: "Something went wrong." });
            } else if (!result.affectedRows) {
              return res.json({ err: "Something went wrong." });
            } else {
              sendEmail(fName, lName, r_name, email, res);
              return res.json({ message: "Successfully declined!", newToken });
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

exports.declineRecipe = declineRecipe;

const sendEmail = (fName, lName, r_name, email, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "myFridge Recipe",
    html:
      `
      <html>
        <head></head>
        <body style="position: relative; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif">
          <div style="background-color: #17a2b8; padding: 40px; text-align: center; color: #fff">
            <h1>We so sorry!</h1>
            <div style="height: 5px; background-color: #fff"></div>
          </div>
          <div style="padding: 50px 0 100px 0; text-align: center;">
            <h2>Dear ${fName} ${lName}, your recipe ${r_name} was declined.</h2>
            <br />
            <br />
            <span>
              Click here to continue:
              <a href="` +
      `${process.env.APP_HOST}` +
      `"
                target="_blank">myFridge.com</a>
            </span>
          </div>
          <div style="position: absolute; width: calc(100% - 40px); bottom: 0; background-color: #17a2b8; padding: 20px; text-align: center;">
            myFridge.com NoCopyright Ⓒ Fábián Dániel | Fogas
            Arnold
          </div>
        </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, (email_err) => {
    if (email_err) {
      console.log(email_err.message);
      return res.json({
        err: "The email was not sent for some reason.",
      });
    } else {
      console.log(`Email sent to ${email}`);
    }
  });
};
