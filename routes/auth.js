var express = require('express'),
    User    = require('../models/user'),
    Token   = require('../models/token'),
    passport = require('passport'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    middleware = require('../middleware'),
    { body, validationResult } = require('express-validator');;

const SMTP_OPTIONS = JSON.parse(process.env.LEAGUE_SMTP);

var router = express.Router();

// USER MANAGEMENT

// Registration routes - to be disabled when up and working

  // Render register page --- Closed for now, invite only
// router.get("/register/", function(req, res){
//   res.render("auth/register", {
//     title: "Sign up - League Wizard"
//   });
// });

  // Render register page using invite link
router.get("/register/:tokenid", function(req, res){
  Token.findOne({ token: req.params.tokenid }, function(err, foundToken) {
      if (err) {
        res.render("error", {error: err});
      } else if (!foundToken || foundToken.tokenType !== "invite") {
        res.json({message: "Invite not found in database"});
      } else {
        res.render("auth/invite-register", {
        title: "Sign up",
        pageType: "registerForm",
        token: foundToken.token,
        inviteEmail: foundToken.inviteEmail
  });
      }
  });
  
});

//
//  OPEN REGISTRATION --- CLOSED FOR NOW, only invitation below
//
//   // Register logic
// router.post("/register", 
//   middleware.userRegisterValidation, 
//   function (req, res) {
//     var newUser = new User( {
//       email: req.body.email,
//       playerName: req.body.playername
//     } );
//     User.register(newUser, req.body.password, 
//       function (err, user) {
//         if (err) {
//           res.render("error", {error: err});
//         } else {
//           var token = new Token({
//             _userId: user._id,
//             token: crypto.randomBytes(16).toString('hex'),
//             tokenType: 'verifyEmail'
//           });
//           token.save(function(err) {
//             if (err) {
//               res.render("error", {error: err});
//             } else {
//               console.log('send email using nodemailer');
//               var transporter = nodemailer.createTransport(SMTP_OPTIONS);
//               transporter.sendMail({
//                 from: 'noreply@leaguewizard.xyz',
//                 to: user.email,
//                 subject: 'Account Verification - League Wizard',
//                 text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttps:\/\/' 
//                 + req.headers.host + '\/confirmation\/' + token.token + '.\n'
//               }, (err, info) => {
//                   if (err) {
//                   res.render("error", {error: err});
//                 } else {
//                   console.log(info.envelope);
//                   console.log(info.messageId);
//                   res.render("auth/emailSent", {
//                     title: "Verify Email - League Wizard"
//                   });
//                 }
//               });
//             }
//           });
//         }
//       });
//   }
// );  

// Invite-only registration logic -- instantly verified email address
router.post("/register", 
  middleware.userRegisterValidation, 
  function (req, res) {
    if (!req.body.token) {
      res.redirect("/");
    }
    Token.findOne({ token: req.body.token }, function(err, foundToken) {
       if (err) {
          res.render("error", {error: err});
        } else if (!foundToken || foundToken.tokenType !== "invite") {
          res.json({message: "Invite not found in database"});
        } else if (!(foundToken.inviteEmail == req.body.email)) { 
          console.log(foundToken.inviteEmail);
          console.log(req.body.email);
          res.json({message: "Invite not valid for this email address"});
        } else {
          var newUser = new User( {
            email: req.body.email,
            playerName: req.body.playername,
            isVerified: true
          } );
          User.register(newUser, req.body.password, 
            function (err, user) {
              if (err) {
                res.render("error", {error: err});
              } else {
                Token.findOneAndDelete({ token: req.body.token })
                .then(() => res.redirect("/login"));
              }
            }
          );
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
      } else if (!foundToken && foundToken.tokenType == 'verifyEmail') {
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
                  title: "Successful verification",
                  pageType: "simple"
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
        var token = new Token({ _userId: foundUser._id, token: crypto.randomBytes(16).toString('hex'), tokenType: 'verifyEmail' });
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
                text: 'Hello,\n\n'
                  + 'Your previous token has been disabled.\n\n'
                  + 'Please verify your account by clicking the following link: \nhttps:\/\/' 
                + req.headers.host + '\/confirmation\/' + token.token
              }, (err, info) => {
                  if (err) {
                  res.status(500).render("error", {error: err});
                } else {
                  console.log(info.envelope);
                  console.log(info.messageId);
                  res.render("auth/emailSent", {
                    title: "Verify Email",
                    pageType: "simple"
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
    title: "Forgotten password",
    pageType: "forgotPassword"
  });
});

// POST send password reset email
router.post("/forgot-password", 
  // express-validator check email address validity
  [ body('email').isEmail().normalizeEmail({gmail_remove_dots: false}) ],
  function(req, res) {
  var validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    res.status(400).json({ errors: validationErrors.array() });
  }
  var email = req.body.email
  User.findOne( {email: email.toLowerCase()}, function(err, foundUser) {
    if (err) { 
      return res.status(500).render("error", {error: err}); 
    } else if (!foundUser) {
        return res.status(401).send({ 
          msg: 'User not found.'
        });
    } else if (!foundUser.isVerified) {
        return res.status(401).send({
          msg: 'User not verified yet. Please verify your email address first.'
        });
    } else {
      // remove any existing token(s) for the user
      Token.deleteMany({ _userId: foundUser._id });
      // Create a verification token, save it, and send email
      var token = new Token({ _userId: foundUser._id, token: crypto.randomBytes(16).toString('hex'), tokenType: 'resetPassword' });
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
              subject: 'League Wizard - Password Reset',
              text: 'Hello,\n\n' + 'Create a new password using the following link: \nhttps:\/\/' 
              + req.headers.host + '\/password-reset\/' + token.token
            }, (err, info) => {
                if (err) {
                res.status(500).render("error", {error: err});
              } else {
                console.log(info.envelope);
                console.log(info.messageId);
                res.render("auth/resetSent", {
                  title: "Email Sent",
                  pageType: "simple"
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
      } else if (!foundToken && foundToken.tokenType == 'resetPassword') {
        return res.status(401).send({ 
          msg: 'The given token is invalid.'
        });
      } else {
        User.findById(foundToken._userId, function(err, foundUser) {
          if (err) {
            res.render("error", {error: err});
          } else {
            res.render("auth/resetPassword", {
              title: "Reset password",
              token: foundToken.token,
              pageType: "registerForm"
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
      }  else if (!foundToken && foundToken.tokenType == 'verifyEmail') {
        return res.status(401).json({ 
          msg: 'The given token is invalid.'
        });
      } else {
        User.findById(foundToken._userId, function(err, foundUser) {
          if (err) {
            res.render("error", {error: err});
          } else {
            var email = req.body.email;
            if (email.toLowerCase() !== foundUser.email) {
              res.status(401).json({ 
                msg: 'The given email address does not match the password reset request.'
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

// AJAX POST send invite email
router.post("/send-invite",
  middleware.isLoggedIn,
  // express-validator check email address validity
  [ body('inviteEmail').isEmail() ],
  function(req, res) {
    var validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json({ errors: validationErrors.array() });
    }
    User.findById(req.user._id, function(err, foundUser) {
        if (err) { 
          return res.status(400).send({error: err});
        } else {
          User.findOne({email: req.body.inviteEmail}, function(err, userExists) {
              if (err) { 
                return res.status(400).send({error: err});
              } else if (userExists) {
                res.json({
                  message: "Email already in use",
                  success: false
                });
              } else {
                var token = new Token({ _userId: foundUser._id, token: crypto.randomBytes(16).toString('hex'), tokenType: 'invite', inviteEmail: req.body.inviteEmail });
                // Save the token
                token.save(function (err) {
                    if (err) { 
                      return res.status(400).send({error: err});
                    } else {
                      // Create nodemailer transporter using AWS SES
                      var transporter = nodemailer.createTransport(SMTP_OPTIONS);  
                        // Send the email
                      transporter.sendMail({
                        from: 'noreply@leaguewizard.xyz',
                        to: req.body.inviteEmail,
                        subject: "League Wizard - You're invited!",
                        text: 'Hello,\n\n' + 'You have been invited by ' + foundUser.playerName 
                              + ' to join LeagueWizard: \nhttps:\/\/' 
                        + req.headers.host + '\/register\/' + token.token
                      }, (err, info) => {
                          if (err) {
                          res.status(400).send({error: err});
                        } else {
                          console.log(info.envelope);
                          console.log(info.messageId);
                          res.json({
                              message: "Invite sent to " + req.body.inviteEmail,
                              success: true
                          });
                        }
                      });
                    }
                });
              }
          });
        }
    });
    
  }
);


// Login routes
  // Show login form
router.get("/login", function(req, res){
  if (req.user) { return res.redirect("/dashboard") }
  res.render("auth/login", {
    title: "Login",
    pageType: "login"
  });
});

  // Login logic
router.post("/login",
  middleware.captchaPassed,
  middleware.userLoginValidation,
  passport.authenticate("local"), 
  function(req, res){
    res.status(200).json({success: true});
});

  // Logout route
router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


module.exports = router;