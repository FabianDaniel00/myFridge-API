const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

// require("dotenv").config();

app.use(express.json({ limit: "5mb" }));
app.use(
  cors({
    origin: process.env.APP_HOST,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "user",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 1000 * 60 * 60 * 24,
    },
  })
);

app.get("/", (req, res) => {
  res.send("<h1>Hi from myFridge API :D</h1>");
});

//Routes
const { usersRouter } = require("./routes/users.js");
app.use("/users", usersRouter);
const { recipesRouter } = require("./routes/recipes.js");
app.use("/recipes", recipesRouter);
const { adminRouter } = require("./routes/admin.js");
app.use("/admin", adminRouter);

const { testRouter } = require("./routes/test.js");
app.use("/test", testRouter);

app.listen(process.env.PORT, () => {
  console.log(`myFridge API is listening on port ${process.env.PORT}...`);
});
