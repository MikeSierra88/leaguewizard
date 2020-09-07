'use strict';
var express = require('express'),
    mongoose = require("mongoose"),
    router = express.Router(),
    middleware = require('../middleware'),
    moment = require('moment'),
    League = require('../models/league'),
    Match = require('../models/match'),
    Team = require('../models/team');

/**
 * MATCH ROUTES
 */

// NEW MATCH FORM

// Now handled through modal dialog

// EDIT MATCH FORM

// Now handled through modal dialog

// AJAX CREATE MATCH
router.post("/:leagueid/matches",
    middleware.isLoggedIn,
    middleware.matchValidation,
    async function(req, res) {
        var session = await mongoose.startSession();
        session.startTransaction();
        await League.findById(req.params.leagueid)
        .then(async function(foundLeague) {
            if (!foundLeague || !foundLeague._id.equals(req.body.league)) { 
                throw new Error("League not found."); 
            }
            // home and away team are equal, match invalid
            if (req.body.homeTeam == req.body.awayTeam) {
                throw new Error("Home and away teams have to be different!"); 
            }
            var newMatch = new Match({
                league: req.body.league,
                homeTeam: req.body.homeTeam,
                awayTeam: req.body.awayTeam,
                homeScore: req.body.homeScore,
                awayScore: req.body.awayScore,
                addedBy: req.user._id,
                date: Date.parse(req.body.date)
            });
            var savedMatch = await newMatch.save();
            return {
                savedMatch,
                foundLeague
            };
        })
        .then(async function(params) {
            var matchQueued = true;
            // if the logged in user is the owner, save the league into the league and teams
            if ( req.user._id.equals(process.env.LEAGUE_SUPERUSER) || req.user._id.equals(params.foundLeague.creator)) {
                // add match to league
                await League.findByIdAndUpdate(
                    params.savedMatch.league,
                    { $push: { matches: params.savedMatch._id } }
                );
                //add match to home team
                await Team.findByIdAndUpdate(
                    params.savedMatch.homeTeam,  
                    {$push: { matches: params.savedMatch._id } }
                );
                //add match to away team
                await Team.findByIdAndUpdate(
                    params.savedMatch.awayTeam,  
                    {$push: { matches: params.savedMatch._id } }
                );
                matchQueued = false;
            // if the logged in user is not the owner, put it in the queue
            // for owner approval
            } else {
                // add match to match approval queue
                await League.findByIdAndUpdate(
                    params.savedMatch.league,
                    { $push: { matchQueue: params.savedMatch._id } }
                );
            }
            return matchQueued;
        })
        .then(async function(matchQueued) {
            await session.commitTransaction();
            session.endSession();
            var message;
            if (matchQueued) { 
                message = "Match added to approval queue";
            } else {
                message = "Match added to league";
            }
            res.status(200).json({
                message: message,
                success: true,
                queued: matchQueued
                });
        })
        .catch(async function(err) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Match could not be saved: " + err,
                success: false
                });
        });
});

// UPDATE MATCH
router.put("/:leagueid/matches",
    middleware.isLoggedIn,
    middleware.isLeagueCreator,
    middleware.matchValidation,
    async function (req, res) {
        var session = await mongoose.startSession();
        session.startTransaction();
        Match.findByIdAndUpdate(req.body.matchId, {
            homeTeam: req.body.homeTeam,
            awayTeam: req.body.awayTeam,
            homeScore: req.body.homeScore,
            awayScore: req.body.awayScore,
            date: Date.parse(req.body.date)
        })
        .then(async function() {
            await session.commitTransaction();
            session.endSession();
            res.status(200).json({
                message: "Match successfully updated",
                success: true
                });
        })
        .catch(async function(err) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({
                message: "Match could not be updated: " + err,
                success: false
                });
        });
    });

// DELETE MATCH
router.delete("/:leagueid/matches/:matchid",
    middleware.isLoggedIn,
    middleware.isLeagueCreator,
    async function(req, res) {
        var session = await mongoose.startSession();
        session.startTransaction();
        // delete match from DB
        Match.findByIdAndRemove(req.params.matchid)
        .then(async function(removedMatch) {
            // remove from league
            await League.updateOne({ 
                    _id: req.params.leagueid }, 
                    { $pullAll: { matches: [req.params.matchid] } 
                });
            // remove from home team
            await Team.updateOne(
                    { _id: removedMatch.homeTeam }, 
                    { $pullAll: { matches: [req.params.matchid] } 
                });
            // remove from away team
            await Team.updateOne(
                    { _id: removedMatch.awayTeam }, 
                    { $pullAll: { matches: [req.params.matchid] } 
                });
        })
        .then(async function() {
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({
                message: "Match successfully removed",
                success: true
                });
        })
        .catch(async function(err) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({
                message: "Match could not be deleted: " + err,
                success: false
                });
        });
    });

/**
 * TEAM ROUTES
 */

// NEW TEAM FORM

// Now handled through modal dialog

// EDIT TEAM FORM

// Now handled through modal dialog

// SHOW TEAM
router.get("/:leagueid/teams/:teamid/:leaguepos", 
    (req, res) => {

    Team.findById(req.params.teamid)
    .populate({
        path: 'matches',
        populate: [{
            path: 'homeTeam',
            model: 'Team'
        }, {
            path: 'awayTeam',
            model: 'Team'
        }]
    })
    .populate({
        path: 'league',
        select: '-matchQueue',
        populate: {
            path: 'teams',
            model: 'Team'
        }
    })
    .then(function(foundTeam) {
        if (foundTeam === undefined || foundTeam === null) {
            var leagueUrl = "/leagues/" + req.params.leagueid;
            res.redirect(leagueUrl);
        } else {
            League.find({})
                .select('-matchQueue')
                .exec(function(err, leagues) {
                    if (err) {
                        res.render("error", { error: err });
                    }
                    res.status(200).render("showTeam", {
                        title: foundTeam.name + " Team Page",
                        team: foundTeam,
                        leaguePos: req.params.leaguepos,
                        leagues: leagues,
                        pageType: "teamShow",
                        moment: moment
                    });
                });
        }
    })
    .catch(err => {
        res.render("error", { error: err });
    });

});

// CREATE TEAM
router.post("/:leagueid/teams", 
    [   middleware.isLoggedIn,
        middleware.isLeagueCreator,
        middleware.teamValidation
    ],
    async function(req, res) {
        var session = await mongoose.startSession();
        session.startTransaction();
        var newTeam = new Team({
            league: req.body.league,
            name: req.body.name,
            footballTeam: req.body.footballTeam
        });
        newTeam.save()
        .then(function(savedTeam) {
            if (req.params.leagueid != req.body.league) {
                throw new Error("Invalid league id");
            }
            return League.findByIdAndUpdate(
                savedTeam.league,
                {$push: { teams: savedTeam._id } }
            );
        })
        .then(async function() {
            await session.commitTransaction();
            session.endSession();
            res.status(200).json({
                message: "Team successfully saved.",
                success: true
                });
        })
        .catch(async function(err) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({
                message: "Team could not be saved: " + err,
                success: false
                });
        });
    });

// UPDATE TEAM
router.put("/:leagueid/teams/:teamid", 
    [   middleware.isLoggedIn,
        middleware.isLeagueCreator,
        middleware.teamValidation
    ],
    async (req, res) => {
        var session = await mongoose.startSession();
        session.startTransaction();
        Team.findByIdAndUpdate(req.params.teamid, {
            name: req.body.name,
            footballTeam: req.body.footballTeam
        })
        .then(async () => {
            await session.commitTransaction();
            session.endSession();
            res.status(200).json({
                message: "Team successfully updated.",
                success: true
                });
            
        })
        .catch(async (err) => {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({
                message: "Team could not be updated: " + err,
                success: false
                });
        });
    });

// DELETE TEAM
router.delete("/:leagueid/teams/:teamid", 
    [   middleware.isLoggedIn,
        middleware.isLeagueCreator
    ],
    async (req, res) => {
        var session = await mongoose.startSession();
        session.startTransaction();
        // remove team from database
        Team.findByIdAndRemove(req.params.teamid)
        .then(async (removedTeam) => {
            await League.updateOne(
                { _id: req.params.leagueid }, 
                { $pullAll: { teams: [removedTeam._id] } }
            );
            removedTeam.matches.forEach(async function(match) {
                await Match.findByIdAndRemove(match)
                    .then(async (removedMatch) => {
                        // update other team's match list
                        var otherTeam;
                        // determine if deleted team is home or away in match
                        if (req.params.teamid == removedMatch.homeTeam) {
                            otherTeam = removedMatch.awayTeam;
                        } else {
                            otherTeam = removedMatch.homeTeam;
                        }
                        await Team.updateOne(
                            { _id: otherTeam }, 
                            { $pullAll: { matches: [removedMatch._id] } }
                        );
                        // update league's match list
                        await League.updateOne(
                            { _id: req.params.leagueid }, 
                            { $pullAll: { matches: [removedMatch._id] } }
                        );
                    })
                    .catch(err => {throw new Error(err)});
            });
        })
        .then(async () => {
            await session.commitTransaction();
            session.endSession();
            res.status(200).json({
                message: "Team successfully deleted.",
                success: true
                });
        })
        .catch(async (err) => {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({
                message: "Team could not be deleted: " + err,
                success: false
                });
        });
    });

/**
 * LEAGUE ROUTES
 */

// leagues aggregate
// redirects to dashboard if logged in, otherwise shows limited-access aggregate
router.get("/", (req, res) => {
    if (req.user) {
        res.redirect("/dashboard");
    } else {
        League.find({}, '-creator')
        .sort('-date')
        .then((leagues) => {
            res.status(200).render("leagues", {
               title: "Active Leagues - Guest mode",
               leagues: leagues,
               pageType: "leagues"
            });
        })
        .catch((err) => res.status(400).render("error", { error: err }));
    }
});

// NEW LEAGUE FORM

// Now handled through modal dialog

// SHOW LEAGUE
router.get("/:id", 
    (req, res) => {
        League.findById(req.params.id)
            .select('-matchQueue')
            .populate("teams")
            .populate("matches")
            .then((foundLeague) => {
                if (foundLeague === undefined || foundLeague === null) {
                    res.redirect("/leagues");
                } else {
                    League.find({}).exec(function(err, leagues) {
                        if (err) {
                            res.render("error", { error: err });
                        }
                        res.status(200).render("showLeague", {
                            title: foundLeague.name + " Standings",
                            league: foundLeague,
                            pageType: "leagueShow",
                            moment: moment
                        });
                    });
                }
            })
            .catch(err => {
                res.render("error", { error: err });
            });
});

// CREATE LEAGUE
router.post("/", [
        middleware.isLoggedIn,
        middleware.leagueValidation
    ],
    (req, res) => {
        var newLeague = new League({
            name: req.body.name,
            creator: req.user._id
        });
        newLeague.save(function(err, savedLeague) {
            if (err) {
                res.status(400).json({
                    message: "League could not be created: " + err,
                    success: false
                    });
            } else {
                res.status(200).json({
                    message: "League successfully created.",
                    success: true
                    });
            }
        });
    });

// UPDATE LEAGUE
router.put("/:leagueid", [
        middleware.isLoggedIn,
        middleware.isLeagueCreator,
        middleware.leagueValidation
    ],
    (req, res) => {
        League.findByIdAndUpdate(req.params.leagueid, {
            name: req.body.name
        })
        .then( () => {
            res.status(200).json({
                message: "League successfully updated.",
                success: true
                });
        })
        .catch(err => {
            res.status(400).json({
                message: "League could not be updated: " + err,
                success: false
                });
        });
    });

// DELETE LEAGUE
router.delete("/:leagueid", [
        middleware.isLoggedIn,
        middleware.isLeagueCreator
    ],
    async (req, res) => {
        var session = await mongoose.startSession();
        session.startTransaction();
        League.findByIdAndRemove(req.params.leagueid)
        .then( (removedLeague) => {
            removedLeague.teams.forEach(async function(team) {
                await Team.findByIdAndRemove(team._id);
            });
            removedLeague.matches.forEach(async function(match) {
                await Match.findByIdAndRemove(match._id);
            });
            removedLeague.matchQueue.forEach(async function(match) {
                await Match.findByIdAndRemove(match._id);
            });
                
        })
        .then(async () => {
            await session.commitTransaction();
            session.endSession();
            res.status(200).json({
                message: "League successfully deleted.",
                success: true
                });
        })
        .catch(async (err) => {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({
                message: "League could not be deleted: " + err,
                success: false
                });
        });
    });

module.exports = router;
