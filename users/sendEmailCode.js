const nodemailer = require("nodemailer");
// require("dotenv").config();

const sendEmailCode = (
  email,
  fName,
  lName,
  verification_code,
  res,
  isVerification
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let registerVerificationLink = `${process.env.APP_HOST}/register_verification`;
  let resetVerificationLink = `${process.env.APP_HOST}/reset_password`;

  if (isVerification) {
    resetVerificationLink = "";
  } else {
    registerVerificationLink = "";
  }

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `${
      isVerification
        ? "Confirm myFridge registration"
        : "Reset password on myFridge"
    }`,
    html: `
      <html>
        <head></head>
        <body style="position: relative; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif">
          <div style="background-color: #17a2b8; padding: 40px; text-align: center; color: #fff">
            <h1>${
              isVerification
                ? "Thank you for registering on myFridge!"
                : "Password reset verification!"
            }</h1>
            <div style="height: 5px; background-color: #fff"></div>
          </div>
          <div style="padding: 50px 0 100px 0; text-align: center;">
            <h2>Dear ${fName} ${lName}, your verification code is</h2>
            <span style="display: inline-block; padding: 15px 20px; border: 1px solid #c7c7c7; font-family: 'Courier New', Courier, monospace;">
              <b>${verification_code}</b>
            </span>
            <br />
            <br />
            <span>
              Click here to verify:
              <a href="${
                isVerification
                  ? registerVerificationLink
                  : resetVerificationLink
              }"
                target="_blank">${
                  isVerification
                    ? registerVerificationLink
                    : resetVerificationLink
                }
              </a>
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

exports.sendEmailCode = sendEmailCode;
