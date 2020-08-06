var express = require('express'),
    AWS = require('aws-sdk'),
    User    = require('../models/user'),
    Token   = require('../models/token'),
    passport = require('passport'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    middleware = require('../middleware');
    
// input validator and sanitizer

AWS.config.update({region: 'eu-central-1'});

var router = express.Router();

// USER MANAGEMENT

// Registration routes - to be disabled when up and working

  // Render register page
router.get("/register", function(req, res){
  res.render("auth/register", {
    title: "League Wizard - Login"
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
              var transporter = nodemailer.createTransport({
                SES: new AWS.SES({
                  apiVersion: '2010-12-01'
                })
              });
              transporter.sendMail({
                from: 'noreply@leaguewizard.xyz',
                to: user.email,
                subject: 'LeagueWizard - Account Verification',
                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' 
                + req.headers.host + '\/confirmation\/' + token.token + '.\n'
              }, (err, info) => {
                  if (err) {
                  res.render("error", {error: err});
                } else {
                  console.log(info.envelope);
                  console.log(info.messageId);
                  res.render("auth/emailSent", {
                    title: "League Wizard - Verify Email"
                  });
                }
              });
            }
          });
        }
      });
  }
);

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
                  title: "League Wizard - Successful verification"
                })
              }
            });
          }
        });
      }
    })
});


  // TBD: resend token
  // router.post("/resend", function(req, res) {});


// Login routes
  // Show login form
router.get("/login", function(req, res){
  res.render("auth/login", {
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