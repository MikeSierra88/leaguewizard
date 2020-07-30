var express = require('express'),
    User    = require('../models/user'),
    passport = require('passport'),
    middleware = require('../middleware');
    
// input validator and sanitizer

var router = express.Router();

// USER MANAGEMENT

// Registration routes - to be disabled when up and working

//   // Render register page
// router.get("/register", function(req, res){
//   res.render("register", {
//     title: "League Wizard - Login"
//   });
// });

//   // Register logic
// router.post("/register", middleware.userRegisterValidation, function(req, res){
//   var newUser = new User({username: req.body.username});
//   User.register(newUser, req.body.password, 
//     function(err, user){
//       if (err) {
//         res.render("error", {error: err});
//       }
//       passport.authenticate("local")(req, res, function(){
//         res.redirect("/leagues");
//       });
//     });
// });

// Login routes
  // Show login form
router.get("/login", function(req, res){
  res.render("login", {
    title: "League Wizard - Login"
  });
});

  // Login logic
router.post("/login",
  middleware.captchaPassed,
  middleware.userLoginValidation,
  passport.authenticate("local", {
      successRedirect: "/leagues",
      failureRedirect: "/login"
    }), 
  // This could be omitted. Left here to show that login logic is in middleware.
  function(req, res){
});

  // Logout route
router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


module.exports = router;