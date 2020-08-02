var express = require('express'),
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

// CREATE MATCH
router.post("/:leagueid/matches",
    middleware.isLoggedIn,
    middleware.matchValidation,
    async function(req, res) {
        if (req.body.homeTeam != req.body.awayTeam) {
            var newMatch = new Match({
                league: req.body.league,
                homeTeam: req.body.homeTeam,
                awayTeam: req.body.awayTeam,
                homeScore: req.body.homeScore,
                awayScore: req.body.awayScore,
                date: Date.parse(req.body.date)
            });
            await newMatch.save(function(err, match) {
                if (err) {
                    res.render("error", { error: err });
                }
                else {
                    League.findById(req.params.leagueid).exec(function(err, foundLeague) {
                        if (err) {
                            res.render("error", { error: err });
                        }
                        else {
                            // insert match id into league's match list
                            foundLeague.matches.push(match._id);
                            foundLeague.save(function(err) {
                                if (err) {
                                    res.render("error", { error: err });
                                }
                                else {
                                    // find home team to update
                                    Team.findById(match.homeTeam).exec(function(err, foundTeam) {
                                        if (err) {
                                            res.render("error", { error: err });
                                        }
                                        else {
                                            foundTeam.matches.push(match._id);
                                            foundTeam.save(function(err) {
                                                if (err) {
                                                    res.render("error", { error: err });
                                                }
                                                else {
                                                    // find away team to update
                                                    Team.findById(match.awayTeam).exec(function(err, foundTeam2) {
                                                        if (err) {
                                                            res.render("error", { error: err });
                                                        }
                                                        else {
                                                            foundTeam2.matches.push(match._id);
                                                            foundTeam2.save(function(err) {
                                                                if (err) {
                                                                    res.render("error", { error: err });
                                                                }
                                                                else {
                                                                    var redirectUrl = "/leagues/" + req.params.leagueid;
                                                                    return res.redirect(redirectUrl);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            var redirectUrl = "/leagues/" + req.params.leagueid + "/matches/new";
            return res.redirect(redirectUrl);
        }
});

// UPDATE MATCH
router.put("/:leagueid/matches",
    middleware.isLoggedIn,
    middleware.matchValidation,
    (req, res) => {
        Match.findByIdAndUpdate(req.body.matchId, {
            homeTeam: req.body.homeTeam,
            awayTeam: req.body.awayTeam,
            homeScore: req.body.homeScore,
            awayScore: req.body.awayScore,
            date: Date.parse(req.body.date)
        }, function(err) {
            if (err) {
                res.render("error", { error: err });
            }
            else {
                var redirectUrl = "/leagues/" + req.params.leagueid;
                res.redirect(redirectUrl);
            }
        });
});

// DELETE MATCH
router.delete("/:leagueid/matches/:matchid",
    middleware.isLoggedIn,
    (req, res) => {
        Match.findByIdAndRemove(req.params.matchid).exec(function(err, removedMatch) {
            if (err) {
                res.render("error", { error: err });
            }
            else {
                League.updateOne({ _id: req.params.leagueid }, { $pullAll: { matches: [req.params.matchid] } }, function(err) {
                    if (err) {
                        res.render("error", { error: err });
                    }
                    else {
                        // remove reference from home team
                        Team.updateOne({ _id: removedMatch.homeTeam }, { $pullAll: { matches: [req.params.matchid] } }, function(err) {
                            if (err) {
                                res.render("error", { error: err });
                            }
                            else {
                                // remove reference from away team
                                Team.updateOne({ _id: removedMatch.awayTeam }, { $pullAll: { matches: [req.params.matchid] } }, function(err) {
                                    if (err) {
                                        res.render("error", { error: err });
                                    }
                                    else {
                                        var redirectUrl = "/leagues/" + req.params.leagueid;
                                        return res.redirect(redirectUrl);
                                    }
                                });
                            }
                        });
                    }
                });
            }
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
router.get("/:leagueid/teams/:teamid/:leaguepos", (req, res) => {

    Team.findById(req.params.teamid).
    populate({
        path: 'matches',
        populate: [{
            path: 'homeTeam',
            model: 'Team'
        }, {
            path: 'awayTeam',
            model: 'Team'
        }]
    }).
    populate({
        path: 'league',
        populate: {
            path: 'teams',
            model: 'Team'
        }
    }).
    exec(function(err, foundTeam) {
        if (err) {
            res.render("error", { error: err });
        }
        else {
            if (foundTeam === undefined || foundTeam === null) {
                var leagueUrl = "/leagues/" + req.params.leagueid;
                res.redirect(leagueUrl);
            }
            else {
                League.find({}).exec(function(err, leagues) {
                    if (err) {
                        res.render("error", { error: err });
                    }
                    res.status(200).render("showTeam", {
                        title: "League Wizard - Standings",
                        team: foundTeam,
                        leaguePos: req.params.leaguepos,
                        leagues: leagues,
                        pageType: "teamShow",
                        moment: moment
                    });
                });
            }
        }
    });

});

// CREATE TEAM
router.post("/:leagueid/teams",
    [middleware.isLoggedIn,
    middleware.isLeagueCreator,
    middleware.teamValidation],
    (req, res) => {
        if (req.params.leagueid === req.body.league) {
            var newTeam = new Team({
                league: req.body.league,
                name: req.body.name,
                footballTeam: req.body.footballTeam
            });
    
            League.findById(req.params.leagueid).exec(function(err, foundLeague) {
                if (err) {
                    res.render("error", { error: err });
                }
                else {
                    if (foundLeague === undefined || foundLeague === null) {
                        res.redirect("/leagues");
                    }
                    else {
                        newTeam.save(function(err, savedTeam) {
                            if (err) {
                                res.render("error", { error: err });
                            }
                            else {
                                foundLeague.teams.push(savedTeam._id);
                                foundLeague.save(function(err) {
                                    if (err) {
                                        res.render("error", { error: err });
                                    }
                                });
                            }
                        });
    
                    }
                }
            });
    
            var redirectUrl = "/leagues/" + req.params.leagueid;
            res.redirect(redirectUrl);
        }
        else {
            res.redirect("/leagues");
        }
});

// UPDATE TEAM
router.put("/:leagueid/teams/:teamid",
    [middleware.isLoggedIn,
    middleware.isLeagueCreator,
    middleware.teamValidation],
    (req, res) => {
        Team.findByIdAndUpdate(req.params.teamid, {
            name: req.body.name,
            footballTeam: req.body.footballTeam
        }, function(err) {
            if (err) {
                res.render("error", { error: err });
            }
            else {
                var redirectUrl = "/leagues/" + req.params.leagueid;
                res.redirect(redirectUrl);
            }
        });
});

// DELETE TEAM
router.delete("/:leagueid/teams/:teamid",
    [middleware.isLoggedIn,
    middleware.isLeagueCreator],
    (req, res) => {
        // remove team from database
        Team.findByIdAndRemove(req.params.teamid, async function(err, removedTeam) {
            if (err) {
                res.render("error", { error: err });
            }
            else {
                // remove reference to team from League team list
                await League.updateOne({ _id: req.params.leagueid }, { $pullAll: { teams: [removedTeam._id] } }, function(err, result) {
                    if (err) {
                        res.render("error", { error: err });
                    }
                    else {
                        // loop through each of the removed team's matches
                        removedTeam.matches.forEach(async function(match) {
                            Match.findByIdAndRemove(match, function(err, removedMatch) {
                                if (err) {
                                    res.render("error", { error: err });
                                }
                                else {
                                    // update other team's match list
                                    var otherTeam;
                                    if (req.params.teamid == removedMatch.homeTeam) {
                                        otherTeam = removedMatch.awayTeam;
                                    }
                                    else {
                                        otherTeam = removedMatch.homeTeam;
                                    }
                                    Team.updateOne({ _id: otherTeam }, { $pullAll: { matches: [removedMatch._id] } }, function(err, result) {
                                        if (err) {
                                            res.render("error", { error: err });
                                        }
    
                                    });
                                    // update league's match list
                                    League.updateOne({ _id: req.params.leagueid }, { $pullAll: { matches: [removedMatch._id] } }, function(err, result) {
                                        if (err) {
                                            res.render("error", { error: err });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
                var redirectUrl = "/leagues/" + req.params.leagueid;
                res.redirect(redirectUrl);
            }
        });
});

/**
 * LEAGUE ROUTES
 */

// leagues aggregate
// for now, redirects to index
router.get("/", (req, res) => {
    res.redirect("/");
});

// NEW LEAGUE FORM

// Now handled through modal dialog

// SHOW LEAGUE
router.get("/:id", (req, res) => {
    League.findById(req.params.id).populate("teams").populate("matches").exec(function(err, foundLeague) {
        if (err) {
            res.render("error", { error: err });
        }
        else {
            if (foundLeague === undefined || foundLeague === null) {
                res.redirect("/leagues");

            }
            else {
                League.find({}).exec(function(err, leagues) {
                    if (err) {
                        res.render("error", { error: err });
                    }
                    res.status(200).render("showLeague", {
                        title: "League Wizard - Standings",
                        league: foundLeague,
                        leagues: leagues,
                        pageType: "leagueShow",
                        moment: moment
                    });
                });
            }

        }
    });
});

// CREATE LEAGUE
router.post("/",
    [middleware.isLoggedIn,
    middleware.leagueValidation],
    (req, res) => {
        var newLeague = new League({
            name: req.body.name,
            creator: req.user._id
        });
        newLeague.save(function(err, savedLeague) {
            if (err) {
                res.render("error", { error: err });
            }
            else {
                var redirectUrl = "/leagues/" + savedLeague._id;
                res.redirect(redirectUrl);
            }
        });
});

// UPDATE LEAGUE
router.put("/:leagueid",
    [middleware.isLoggedIn,
    middleware.isLeagueCreator,
    middleware.leagueValidation],
    (req, res) => {
        League.findByIdAndUpdate(req.params.leagueid, {
            name: req.body.name
        }, function(err){
            if (err) {
                res.render("error", { error: err });
            }
            else {
                var redirectUrl = "/leagues/" + req.params.leagueid;
                res.redirect(redirectUrl);
            }
        });
    
});

// DELETE LEAGUE
router.delete("/:leagueid",
    [middleware.isLoggedIn,
    middleware.isLeagueCreator],
    (req, res) => {
        League.findByIdAndRemove(req.params.leagueid, (err, removedLeague) => {
            if (err) {
                res.render("error", { error: err });
            }
            else {
                removedLeague.teams.forEach(async function(team) {
                    await Team.findByIdAndRemove(team._id);
                });
                removedLeague.matches.forEach(async function(match) {
                    await Match.findByIdAndRemove(match._id);
                });
                res.redirect("/leagues");
            }
        });
});

module.exports = router;
