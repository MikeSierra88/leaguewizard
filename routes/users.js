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
                        title: "League Wizard - My Profile",
                        leagues: leagues
                    });
                }
            });
        } else {
            res.redirect("/")
        }
    }
);

module.exports = router;