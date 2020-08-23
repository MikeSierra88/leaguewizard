'use strict';
var express    = require('express'),
    router     = express.Router(),
    middleware = require('../middleware'),
    League     = require('../models/league');

// ROUTERS
var leagueRouter = require('./leagues'),
    leagueAdminRouter = require("./leagueAdmin"),
    authRouter   = require('./auth'),
    userRouter   = require('./users');

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
        League.find({ creator: req.user._id }).exec(function(err, myLeagues) {
            if (err) {
                res.render("error", { error: err });
            }
            else {
                League.find().exec(function(err, allLeagues) {
                    if (err) {
                        res.render("error", { error: err });
                    } else {
                        res.status(200).render("users/dashboard", {
                            title: "Dashboard - League Wizard",
                            allLeagues: allLeagues,
                            myLeagues: myLeagues,
                            pageType: "dashboard"
                        });
                    }
                });
            }
        });
    }
);

// IMPORTING ROUTERS

    // LEAGUE HANDLING
    router.use("/leagues", leagueRouter);
    router.use("/league-admin", leagueAdminRouter);
    
    // USER HANDLING
    router.use("/users", userRouter);
    
    // AUTH HANDLING
    router.use(authRouter);

// CATCHALL

router.get("*", (req, res) => {
    res.redirect("/");
});

module.exports = router;