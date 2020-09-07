'use strict';
var express    = require('express'),
    router     = express.Router(),
    moment     = require('moment'),
    mongoose   = require("mongoose"),
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
    async (req, res) => {
        var session = await mongoose.startSession();
        session.startTransaction();
        League.findById(req.params.leagueid)
        .then((foundLeague) => {
            if (!foundLeague.matchQueue.includes(req.params.matchid)) {
                throw new Error("Given match id is not in match queue");
            }
            foundLeague.matches.push(req.params.matchid);
            foundLeague.matchQueue.splice(foundLeague.matchQueue.indexOf(req.params.matchid), 1);
            return foundLeague.save();
        })
        .then(async () => {
            var match = await Match.findById(req.params.matchid);
            // Add match to home team
            await Team.findByIdAndUpdate(
                match.homeTeam,
                {$push: {matches: match._id} }
                );
                
            // Add match to away team
            await Team.findByIdAndUpdate(
                match.awayTeam,
                {$push: {matches: match._id} }
                );
        })
        .then(async () => {
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({
                message: "Match successfully added to league",
                success: true
                });
        })
        .catch(async (err) => {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Match could not be saved: " + err,
                success: false
                });
        });
});

// AJAX reject match from queue
router.post("/:leagueid/reject-match/:matchid",
    middleware.isLoggedIn,
    middleware.isLeagueCreator,
    async (req, res) => {
        var session = await mongoose.startSession();
        session.startTransaction();
        Match.findByIdAndRemove(req.params.matchid)
        .then(async (removedMatch) => {
            return League.findByIdAndUpdate(
                removedMatch.league,
                { $pull: {matchQueue: removedMatch._id} }
                );
        })
        .then(async () => {
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({
                message: "Match rejected",
                success: true
                });
        })
        .catch(async (err) => {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Error while rejecting match: " + err,
                success: false
                });
        });
});

router.get("/", function(req, res) {
    res.redirect("/");
});


module.exports = router;