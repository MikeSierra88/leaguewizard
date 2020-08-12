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
            res.redirect("/")
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
          })
      }
    });
  }
);

module.exports = router;