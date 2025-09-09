const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/user.js");

router
  .route("/signup")
  .get(userController.renderSignupForm) // Get signup form
  .post(wrapAsync(userController.signup)); // Post signup form

router
  .route("/login")
  .get(userController.renderLoginForm) // Get login form
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  ); // Post login form

// Logout route
router.get("/logout", userController.logout);

module.exports = router;
