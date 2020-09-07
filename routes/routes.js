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
    res.status(200).render("index", {
        title: "",
        pageType: "landing"
    });
});

// dashboard route
router.get("/dashboard", 
    middleware.isLoggedIn,
    function(req, res) {
        League.find({ creator: req.user._id })
        .sort('-date')
        .then( (myLeagues) => {
            League.find({})
            .sort('-date')
            .then( (allLeagues) => {
                res.status(200).render("users/dashboard", {
                    title: "Dashboard",
                    allLeagues: allLeagues,
                    myLeagues: myLeagues,
                    pageType: "dashboard"
                });
            });
        })
        .catch( err => { res.render("error", { error: err }); } );
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