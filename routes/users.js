'use strict';
var express    = require('express'),
    middleware = require('../middleware'),
    User       = require('../models/user'),
    League       = require('../models/league');
    
var router = express.Router();

router.get("/:userid", 
    middleware.isLoggedIn,
    function(req, res) {
        if ( req.user._id.equals(req.params.userid) ) {
            League.find({ creator: req.params.userid }).exec(function(err, leagues) {
                if (err) {
                    res.render("error", { error: err });
                }
                else {
                    res.status(200).render("users/profile", {
                        title: "My Profile - League Wizard",
                        leagues: leagues,
                        pageType: "userProfile"
                    });
                }
            });
        } else {
            res.redirect("/");
        }
    }
);

// POST change password
router.post("/:userid/change-password", 
  middleware.isLoggedIn,
  middleware.passwordChangeValidation,
  function(req, res) {
    User.findById( req.params.userid, function(err, foundUser) {
      if (err) {
        res.render("error", {error: err});
      } else {
          foundUser.changePassword(req.body.oldPassword, req.body.newPassword, function(err) {
              if (err) {
                  res.render("error", {error: err});
              } else {
                  var redirectUrl = "/users/" + req.params.userid;
                  res.redirect(redirectUrl);
              }
          });
      }
    });
  }
);


// POST AJAX add league to favorites
router.post("/:userid/add-favorite/:leagueid",
    middleware.isLoggedIn,
    function(req, res) {
        // Check if userid matches logged in user
        User.findById(req.params.userid, function(err, foundUser) {
            if (err) {
                res.json({
                    message: "Error: " + err,
                    success: false
                });
              } else {
                if (foundUser._id.equals(req.user._id)) {
                    // Check if League is already in favorites
                    if (foundUser.favoriteLeagues.includes(req.params.leagueid)) {
                        res.json({
                            message: "Already in the favorites",
                            success: false
                        });
                    } else {
                        // Check is League exists
                        League.findById(req.params.leagueid, function(err, foundLeague) {
                            if (err) {
                                res.json({
                                    message: "Error: " + err,
                                    success: false
                                });
                            } else if (!foundLeague) {
                                res.json({
                                    message: "League not found",
                                    success: false
                                });
                            } else {
                                // add league to favorites, save changes
                                foundUser.favoriteLeagues.push(foundLeague._id);
                                foundUser.save(function(err) {
                                   if (err) {
                                        res.json({
                                            message: "Error: " + err,
                                            success: false
                                        });
                                    } else {
                                        res.json({
                                            message: "Added to favorites",
                                            success: true
                                        });
                                    }
                                });
                            }
                        });
                    }
                } else {
                    res.json({
                        message: "Invalid user id",
                        success: false
                    });
                }
              }
        });
    }
);

// POST AJAX remove league from favorites
router.post("/:userid/remove-favorite/:leagueid",
    middleware.isLoggedIn,
    function(req, res) {
        // Look up user based on userid in url
        User.findById(req.params.userid, function(err, foundUser) {
            if (err) {
                return res.json({
                    message: "Error: " + err,
                    success: false
                });
            // No associated user found
            } else if (!foundUser) {
                return res.json({
                    message: "User not found",
                    success: false
                });
            // leagueid is not in favorites array
            } else if (!foundUser.favoriteLeagues.includes(req.params.leagueid)) {
                return res.json({
                    message: "League not in favorites",
                    success: false
                });
            // if everything passed, remove from list and save changes
            } else {
                foundUser.favoriteLeagues.splice(foundUser.favoriteLeagues.indexOf(req.params.leagueid), 1);
                foundUser.save(function(err) {
                    if (err) {
                        return res.json({
                            message: "Error: " + err,
                            success: false
                        });
                    } else {
                        return res.json({
                            message: "League removed from favorites",
                            success: true
                        });
                    }
                });
            }
        });
    }
);



module.exports = router;