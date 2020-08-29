'use strict';
var express    = require('express'),
    router     = express.Router(),
    moment     = require('moment'),
    middleware = require('../middleware'),
    User       = require('../models/user'),
    Match      = require('../models/match'),
    Team       = require('../models/team'),
    League     = require('../models/league');
    

router.get("/:leagueid", 
    middleware.isLoggedIn,
    middleware.isLeagueCreator,
    function(req, res) {
        League.findById(req.params.leagueid)
            .populate({
                path: "matchQueue",
                populate: [{
                    path: 'addedBy',
                    model: 'User',
                    select: 'playerName -_id'
                },{
                    path: "homeTeam",
                    select: 'name footballTeam'
                },{
                    path: "awayTeam",
                    select: 'name footballTeam'
                }
                ]
            })
            .exec( async function(err, foundLeague) {
                if (err) {
                    res.status(500).render("error", {error: err});
                } else {
                    // NOT IMPLEMENTED YET - League user list
                    // var userList = await User.find( { isVerified: true }, {playerName: 1} );
                    if (req.user._id.equals(process.env.LEAGUE_SUPERUSER) || req.user._id.equals(foundLeague.creator)) {
                        res.render("league-admin/index", {
                            title: "League Management - League Wizard",
                            pageType: "leagueAdmin",
                            isOwner: true,
                            league: foundLeague,
                            moment: moment
                        });
                    // NOT IMPLEMENTED YET - Admin user level
                    // } else if (foundLeague.admins.contains(req.user._id)) {
                    //     res.send("ONLY ADMIN")
                    } else {
                        res.redirect("/");
                    }
                } 
        });
});

// AJAX approve match from queue
router.post("/:leagueid/approve-match/:matchid",
    middleware.isLoggedIn,
    middleware.isLeagueCreator,
    function(req, res) {
        League.findById(req.params.leagueid)
            .exec( async function(err, foundLeague) {
                if (err) {
                    return res.status(400).json({
                        message: "Match could not be saved: " + err,
                        success: false
                        });
                } else {
                    console.log(foundLeague);
                    if (!foundLeague.matchQueue.includes(req.params.matchid)) {
                        return res.status(400).json({
                            message: "Given match id is not in match queue",
                            success: false
                        });
                    }
                        
                    Match.findById(req.params.matchid, function(err, foundMatch) {
                        if (err) {
                            return res.status(400).json({
                                message: "Match could not be saved: " + err,
                                success: false
                                });
                        }
                        foundLeague.matches.push(foundMatch._id);
                        foundLeague.matchQueue.splice(foundLeague.matchQueue.indexOf(foundMatch._id), 1);
                        foundLeague.save(function(err) {
                            if (err) {
                                return res.status(400).json({
                                    message: "Match could not be saved: " + err,
                                    success: false
                                    });
                            }
                            Team.findById(foundMatch.homeTeam, function (err, foundTeam1) {
                                if (err) {
                                    return res.status(400).json({
                                        message: "Match could not be saved: " + err,
                                        success: false
                                        });
                                }
                                foundTeam1.matches.push(foundMatch._id);
                                foundTeam1.save(function(err) {
                                    if (err) {
                                        return res.status(400).json({
                                            message: "Match could not be saved: " + err,
                                            success: false
                                            });
                                    }
                                    Team.findById(foundMatch.awayTeam, function(err, foundTeam2) {
                                        if (err) {
                                            return res.status(400).json({
                                                message: "Match could not be saved: " + err,
                                                success: false
                                                });
                                        }
                                        foundTeam2.matches.push(foundMatch._id);
                                        foundTeam2.save(function(err) {
                                            if (err) {
                                                return res.status(400).json({
                                                    message: "Match could not be saved: " + err,
                                                    success: false
                                                    });
                                            }
                                            return res.status(202).json({
                                                message: "Match successfully added to league",
                                                success: true
                                                });
                                        });
                                    });
                                });
                            });
                        });
                    });
                }
            });
});

// AJAX reject match from queue
router.post("/:leagueid/reject-match/:matchid",
    middleware.isLoggedIn,
    middleware.isLeagueCreator,
    function(req, res) {
        Match.findByIdAndRemove(req.params.matchid, function(err) {
            if (err) {
                return res.status(400).json({
                    message: "Error while rejecting match: " + err,
                    success: false
                    });
            }
            League.findById(req.params.leagueid, function(err, foundLeague) {
                if (err) {
                    return res.status(400).json({
                        message: "Error while rejecting match: " + err,
                        success: false
                        });
                }
                foundLeague.matches.push(req.params.matchid);
                foundLeague.matchQueue.splice(foundLeague.matchQueue.indexOf(req.params.matchid), 1);
                foundLeague.save(function(err) {
                    if (err) {
                        return res.status(400).json({
                            message: "Error while rejecting match: " + err,
                            success: false
                            });
                    }
                    return res.status(202).json({
                        message: "Match rejected",
                        success: true
                    });
                });
            });
            
        });
});

router.get("/", function(req, res) {
    res.redirect("/");
});


module.exports = router;