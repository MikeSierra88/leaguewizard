// Middlewares
var { param, check, validationResult } = require('express-validator'),
  mongoose = require('mongoose'),
  fetch    = require('isomorphic-fetch'),
  League   = require('../models/league'),
  User     = require('../models/user');

var middlewareObj = {};

// reCAPTCHA middleware for login
middlewareObj.captchaPassed = function(req, res, next) {
  if (req.body['g-recaptcha-response'] === undefined ||
    req.body['g-recaptcha-response'] === '' ||
    req.body['g-recaptcha-response'] === null) {
    return res.json({ "responseError": "something goes wrong" });
  }

  var verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.LEAGUE_RECAPTCHA_SECRET + "&response=" + req.body['g-recaptcha-response'];
  fetch(verificationURL, { method: 'post' })
    .then(response => response.json())
    .then(google_response => {
      console.log(google_response);
      if (google_response.success) {
        next();
      }
      else {
        res.redirect("/login");
      }
    })
    .catch(error => res.render("error", { error: error }));
};

// Auth middleware to check if user is logged in
middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

// Auth middleware to check if user is creator of the league
middlewareObj.isLeagueCreator = function(req, res, next) {
  // If user is superuser, skip ownership check
  if ( mongoose.Types.ObjectId(process.env.LEAGUE_SUPERUSER).equals(req.user._id) ) {
    next();
  } else {
    // Find league based on id from url
    League.findById(req.params.leagueid, function(err, foundLeague) {
      if (err) {
        res.render("error", { error: err });
      } else {
        // Check if user is creator of the league
        if (foundLeague.creator._id.equals(req.user._id)) {
          next();
        } else {
          res.status(401).send("UNAUTHORIZED");
          // res.redirect("/login");
        }
      }
    });
  }
};


// Auth middleware to sanitize and validate registration data
middlewareObj.userRegisterValidation = async function(req, res, next) {
  
  // fields are not empty
  await check('email').exists().run(req);
  await check('password').exists().run(req);
  await check('playername').exists().run(req);
  
  // sanitize all and check email and password format
  await check('email').normalizeEmail().isEmail().run(req);
  await check('playername').trim().escape().run(req);
  await check('password').trim().escape().matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,64}$/, "g").run(req);

  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
};

// Auth middleware to sanitize and validate change password entry
middlewareObj.passwordChangeValidation = async function(req, res, next) {
  // fields are not empty
  await check('oldPassword').exists().run(req);
  await check('newPassword').exists().run(req);
  await check('confirmNewPassword').exists().run(req);
  
  // sanitize all and check email and password format
  await check('oldPassword').trim().escape().matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,64}$/, "g").run(req);
  await check('newPassword').trim().escape()
          .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,64}$/, "g")
          .custom((value, { req }) => {
            if (value !== req.body.confirmNewPassword) {
              throw new Error("Passwords don't match");
            } else {
              return true;
            }
          })
          .run(req);

  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
};

// Auth middleware to sanitize and validate reset password entry
middlewareObj.passwordResetValidation = async function(req, res, next) {
  // fields are not empty
  await check('email').exists().run(req);
  await check('newPassword').exists().run(req);
  await check('confirmNewPassword').exists().run(req);
  
  // sanitize all and check email and password format
  await check('email').normalizeEmail()
          .isEmail()
          .run(req);
  await check('newPassword').trim().escape()
          .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,64}$/, "g")
          // check if matches confirmation
          .custom((value, { req }) => {
            if (value !== req.body.confirmNewPassword) {
              throw new Error("Passwords don't match");
            } else {
              return true;
            }
          })
          .run(req);

  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
};

// Auth middleware to sanitize and validate token resend data
middlewareObj.userResendValidation = async function(req, res, next) {
  
  // fields are not empty
  await check('email').exists().run(req);
  
  // sanitize all and check email and password format
  await check('email').normalizeEmail().isEmail().run(req);

  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
};

// Auth middleware to sanitize and validate login data
middlewareObj.userLoginValidation = async function(req, res, next) {
  
  // fields are not empty
  await check('email').exists().run(req);
  await check('password').exists().run(req);
  
  // sanitize all and check email and password format
  await check('email').normalizeEmail().isEmail().run(req);
  await check('password').trim().escape().run(req);

  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  } else {
    
    // Find user in database
    User.findOne({ email: req.body.email }, function(err, user) {
      if (err) {
        return res.render("error", { error: err });
      } else if (!user) {
        // If user not found based on email address, notify user
        return res.status(401).send({ 
          msg: 'The email address ' + req.body.email + 
                ' is not associated with any account. Double-check your email address and try again.'
        });
      } else if (!user.isVerified) { 
        // Make sure the user has been verified
        return res.render("auth/notVerified", {
          title: "Email not verified - League Wizard",
          unverifiedUserEmail: user.email
        });
      } else {
        next();
      }
      
    });
    
    
  }
};

middlewareObj.teamValidation = async function(req, res, next) {
  await check('name').trim().escape().run(req);
  await check('footballTeam').trim().escape().run(req);

  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
}

middlewareObj.leagueValidation = async function(req, res, next) {
  await check('name').trim().escape().run(req);

  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
}

middlewareObj.matchValidation = async function(req, res, next) {
  await check('homeScore').trim().escape().isInt().run(req);
  await check('awayScore').trim().escape().isInt().run(req);

  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
}

module.exports = middlewareObj;
