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
                leagues: leagues
            });
        }
    });
});

// catchall route

router.get("*", (req, res) => {
    res.redirect("/");
});

module.exports = router;