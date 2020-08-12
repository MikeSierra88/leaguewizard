var express = require('express'),
    User    = require('../models/user'),
    Token   = require('../models/token'),
    passport = require('passport'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    middleware = require('../middleware');

const SMTP_OPTIONS = JSON.parse(process.env.LEAGUE_SMTP);

var router = express.Router();

// USER MANAGEMENT

// Registration routes - to be disabled when up and working

  // Render register page
router.get("/register", function(req, res){
  res.render("auth/register", {
    title: "Login - League Wizard"
  });
});

  // Register logic
router.post("/register", 
  middleware.userRegisterValidation, 
  function (req, res) {
    var newUser = new User( {
      email: req.body.email,
      playerName: req.body.playername
    } );
    User.register(newUser, req.body.password, 
      function (err, user) {
        if (err) {
          res.render("error", {error: err});
        } else {
          var token = new Token({
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
          });
          token.save(function(err) {
            if (err) {
              res.render("error", {error: err});
            } else {
              console.log('send email using nodemailer');
              var transporter = nodemailer.createTransport(SMTP_OPTIONS);
              transporter.sendMail({
                from: 'noreply@leaguewizard.xyz',
                to: user.email,
                subject: 'Account Verification - League Wizard',
                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttps:\/\/' 
                + req.headers.host + '\/confirmation\/' + token.token + '.\n'
              }, (err, info) => {
                  if (err) {
                  res.render("error", {error: err});
                } else {
                  console.log(info.envelope);
                  console.log(info.messageId);
                  res.render("auth/emailSent", {
                    title: "Verify Email - League Wizard"
                  });
                }
              });
            }
          });
        }
      });
  }
);

// EMAIL TEST

// router.get("/emailtest", function(req, res) {
//   res.render("auth/emailTest", {
//     title: "Email test"
//   });
// });

// router.post("/emailtest", function(req, res) {
//   var transporter = nodemailer.createTransport(SMTP_OPTIONS);
//   transporter.sendMail({
//     from: 'noreply@leaguewizard.xyz',
//     to: req.body.email,
//     subject: 'Account Verification - League Wizard',
//     text: 'Hello,\n\n' + 'This is a test email'
//   }, (err, info) => {
//       if (err) {
//       res.render("error", {error: err});
//     } else {
//       console.log(info.envelope);
//       console.log(info.messageId);
//       res.status(200).send("EMAIL POST ROUTE FINISHED");
//     }
//   });
  
// });

// Email verification routes

  // Confirmation GET route, after clicking link in email
router.get("/confirmation/:tokenid",
  function(req, res) {
    // find token based on id in url
    Token.findOne({ token: req.params.tokenid }, function(err, foundToken) {
      if (err) {
        res.render("error", {error: err});
      } else if (!foundToken) {
        return res.status(401).send({ 
          msg: 'The given token is invalid.'
        });
      } else {
        
        User.findById(foundToken._userId, function(err, foundUser) {
          if (err) {
            res.render("error", {error: err});
          } else if (!foundUser) {
            return res.status(401).send({ 
              msg: 'User not found'
            });
          } else {
            foundUser.isVerified = true;
            foundUser.save(function(err) {
              if (err) {
                res.render("error", {error: err});
              } else {
                foundToken.remove();
                res.render("auth/verified", {
                  title: "Successful verification - League Wizard"
                });
              }
            });
          }
        });
      }
    });
});


  // resend token
router.post("/resend", 
  middleware.userResendValidation,
  function(req, res) {
    User.findOne( {email: req.body.email}, function(err, foundUser) {
      if (err) {
        res.status(500).render("error", {error: err});
      } else if (!foundUser) {
        return res.status(400).send({ msg: 'We were unable to find a user with that email.' }); 
      } else if (foundUser.isVerified) {
        return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });
      } else {
        // if there is an existing token for the user, remove it
        Token.findOneAndRemove({ _userId: foundUser._id });
        // Create a verification token, save it, and send email
        var token = new Token({ _userId: foundUser._id, token: crypto.randomBytes(16).toString('hex') });
        // Save the token
        token.save(function (err) {
            if (err) { 
              return res.status(500).render("error", {error: err}); 
            } else {
              // Create nodemailer transporter using AWS SES
              var transporter = nodemailer.createTransport(SMTP_OPTIONS);  
                // Send the email
              transporter.sendMail({
                from: 'noreply@leaguewizard.xyz',
                to: foundUser.email,
                subject: 'Account Verification - League Wizard',
                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttps:\/\/' 
                + req.headers.host + '\/confirmation\/' + token.token + '.\n'
              }, (err, info) => {
                  if (err) {
                  res.status(500).render("error", {error: err});
                } else {
                  console.log(info.envelope);
                  console.log(info.messageId);
                  res.render("auth/emailSent", {
                    title: "Verify Email - League Wizard"
                  });
                }
              });
            }
        });
      }
    });
  }
);

// GET Forgot password form
router.get("/forgot-password", function(req, res) {
  res.render("auth/forgotPassword", {
    title: "Forgotten password - League Wizard"
  });
});

// POST send password reset email
router.post("/forgot-password", function(req, res) {
  User.findOne( {email: req.body.email}, function(err, foundUser) {
    if (err) { 
      return res.status(500).render("error", {error: err}); 
    } else if (!foundUser) {
        return res.status(401).send({ 
          msg: 'User not found'
        });
    } else if (!foundUser.isVerified) {
        return res.status(401).send({
          msg: 'User not verified. '
        });
    } else {
      // remove any existing token(s) for the user
      Token.deleteMany({ _userId: foundUser._id });
      // Create a verification token, save it, and send email
      var token = new Token({ _userId: foundUser._id, token: crypto.randomBytes(16).toString('hex') });
      // Save the token
      token.save(function (err) {
          if (err) { 
            return res.status(500).render("error", {error: err}); 
          } else {
            // Create nodemailer transporter using AWS SES
            var transporter = nodemailer.createTransport(SMTP_OPTIONS);  
              // Send the email
            transporter.sendMail({
              from: 'noreply@leaguewizard.xyz',
              to: foundUser.email,
              subject: 'Account Verification - League Wizard',
              text: 'Hello,\n\n' + 'Create a new password using the following link: \nhttps:\/\/' 
              + req.headers.host + '\/password-reset\/' + token.token + '.\n'
            }, (err, info) => {
                if (err) {
                res.status(500).render("error", {error: err});
              } else {
                console.log(info.envelope);
                console.log(info.messageId);
                res.render("auth/resetSent", {
                  title: "Email Sent - League Wizard"
                });
              }
            });
          }
      });
    }
  });
});

// GET password reset form after clicking link
router.get("/password-reset/:token",
  function(req, res) {
    // find token based on id in url
    Token.findOne({ token: req.params.token }, function(err, foundToken) {
      if (err) {
        res.render("error", {error: err});
      } else if (!foundToken) {
        return res.status(401).send({ 
          msg: 'The given token is invalid.'
        });
      } else {
        User.findById(foundToken._userId, function(err, foundUser) {
          if (err) {
            res.render("error", {error: err});
          } else {
            res.render("auth/resetPassword", {
              title: "Reset password - League Wizard",
              token: foundToken.token
            });
          }
        });
      }
    });
});

// POST reset password
router.post("/password-reset", 
  middleware.passwordResetValidation,
  function(req, res) {
    Token.findOneAndRemove({ token: req.body.token}, function(err, foundToken) {
      if (err) {
        res.render("error", {error: err});
      } else {
        User.findById(foundToken._userId, function(err, foundUser) {
          if (err) {
            res.render("error", {error: err});
          } else {
            if (req.body.email !== foundUser.email) {
              res.status(401).send({ 
                msg: 'The given email address does not match password reset request.'
              });
            } else {
              foundUser.setPassword(req.body.newPassword, function() {
                foundUser.save(function() {
                  res.redirect("/login");
                });
              });
            }
          }
        });
      }
    });
  }
);



// Login routes
  // Show login form
router.get("/login", function(req, res){
  res.render("auth/login", {
    title: "Login - League Wizard"
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