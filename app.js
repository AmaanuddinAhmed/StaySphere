if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// From routes folder
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const app = express();
const port = 8080;
// const MONGO_URL = "mongodb://127.0.0.1:27017/staysphere";
const dbUrl = process.env.ATLAS_URL;

main()
  .then(() => console.log("Connection successful!"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Store setup
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO STORE", err);
});

// Session setup
const sessionOptions = {
  store, // same as store: store
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

// Flash setup
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Using passport local strategy
passport.use(new LocalStrategy(User.authenticate()));
// Storing & Removing info. about user in session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Local storage
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// // Root route
// app.get("/", (req, res) => {
//   res.send("StaySphere website working!");
// });

// Using Express routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get("/addUser", async (req, res) => {
//   let newUser = new User({
//     username: "Test",
//     email: "test@gmail.com",
//   });

//   let addedUser = await User.register(newUser, "test");
//   console.log(addedUser);
//   res.send("success");
// });

// ERROR HANDLING

// For incorrect routes
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Default
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  // console.log(err);
  res.status(status).render("error.ejs", { message });
});

// Listening
app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
