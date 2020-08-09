var express    = require('express'),
    router     = express.Router(),
    middleware = require('../middleware'),
    League     = require('../models/league');


// index route
router.get("/", (req, res) => {
    League.find({}).exec(function(err, leagues) {
        if (err) {
            res.render("error", { error: err });
        }
        else {
            res.status(200).render("index", {
                title: "League Wizard",
                leagues: leagues,
                pageType: "index"
            });
        }
    });
});

// dashboard route
router.get("/dashboard", 
    middleware.isLoggedIn,
    function(req, res) {
        League.find({ creator: req.user._id }).exec(function(err, leagues) {
            if (err) {
                res.render("error", { error: err });
            }
            else {
                res.status(200).render("users/dashboard", {
                    title: "Dashboard - League Wizard",
                    leagues: leagues
                });
            }
        });
    }
);

// catchall route

router.get("*", (req, res) => {
    res.redirect("/");
});

module.exports = router;