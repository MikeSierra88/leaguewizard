var express    = require('express'),
    router     = express.Router(),
    middleware = require('../middleware'),
    moment     = require('moment'),
    League     = require('../models/league'),
    Match      = require('../models/match'),
    Team       = require('../models/team');

/**
 * MATCH ROUTES
 */

// NEW MATCH FORM
router.get("/:leagueid/matches/new", (req, res) => {
    League.findById(req.params.leagueid).populate("teams").exec(function(err, foundLeague) {
        if (err) {
            res.render("error", { error: err });
        }
        else {
            if (foundLeague === undefined || foundLeague === null) {
                res.redirect("/leagues");
            }
            else {
                res.status(200).render("newMatch", {
                    title: "League Wizard - Add Match",
                    league: foundLeague
                });
            }
        }
    });
});

// EDIT MATCH FORM
router.get("/:leagueid/matches/:matchid/edit", (req, res) => {
   Match.findById(req.params.matchid, (err, foundMatch) => {
      if (err) {
          res.render("error", { error: err });
      } else {
          League.findById(req.params.leagueid).populate("teams").exec(function(err, foundLeague) {
                if (err) {
                    res.render("error", { error: err });
                } else {
                    res.status(200).render("editMatch", {
                      title: "League Wizard - Edit Match",
                      match: foundMatch,
                      league: foundLeague
                    });
                }
            });
          
      }
   });
});

// CREATE MATCH
router.post("/:leagueid/matches", async function(req, res) {
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
router.put("/:leagueid/matches", (req, res) => {
    // TODO LOGIC
    // GOT TO UPDATE TEAMS TOO!
    Match.findByIdAndUpdate(req.body.matchId, {
        homeTeam: req.body.homeTeam,
        awayTeam: req.body.awayTeam,
        homeScore: req.body.homeScore,
        awayScore: req.body.awayScore,
        date: Date.parse(req.body.date)
    }, function(err) {
        if (err) {
            res.render("error", { error: err });
        } else {
            var redirectUrl = "/leagues/" + req.params.leagueid;
            res.redirect(redirectUrl);
        }
    });
});

// DELETE MATCH
router.delete("/:leagueid/matches/:matchid", (req, res) => {
    Match.findByIdAndRemove(req.params.matchid).exec(function(err, removedMatch) {
        if (err) {
            res.render("error", { error: err });
        } else {
            League.updateOne({_id: req.params.leagueid}, { $pullAll: {matches: [req.params.matchid] } }, function(err) {
                if (err) {
                    res.render("error", { error: err });
                } else {
                    // remove reference from home team
                    Team.updateOne({_id: removedMatch.homeTeam}, { $pullAll: {matches: [req.params.matchid] } }, function(err) {
                        if (err) {
                            res.render("error", { error: err });
                        } else {
                            // remove reference from away team
                            Team.updateOne({_id: removedMatch.awayTeam}, { $pullAll: {matches: [req.params.matchid] } }, function(err) {
                                if (err) {
                                    res.render("error", { error: err });
                                } else {
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
router.get("/:leagueid/teams/new", (req, res) => {
    League.findById(req.params.leagueid).exec(function(err, foundLeague) {
        if (err) {
            res.render("error", { error: err });
        }
        else {
            if (foundLeague === undefined || foundLeague === null) {
                res.redirect("/leagues");
            }
            else {
                res.status(200).render("newTeam", {
                    title: "League Wizard - Add team to league: " + foundLeague.name,
                    league: foundLeague
                });
            }
        }
    });
});

// SHOW TEAM
router.get("/:leagueid/teams/:teamid", (req, res) => {

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
                    console.log("Team not found");
                    var leagueUrl = "/leagues/" + req.params.leagueid;
                    res.redirect(leagueUrl);
                }
                else {
                    res.status(200).render("showTeam", {
                        title: "League Wizard - Standings",
                        team: foundTeam,
                        moment: moment
                    });
                }
            }
    });

});

// EDIT TEAM FORM
router.get("/:leagueid/teams/:teamid/edit", (req, res) => {
    Team.findById(req.params.teamid, (err, foundTeam) => {
       if (err) {
           res.render("error", { error: err });
       } else {
           res.status(200).render("editTeam", {
                    title: "League Wizard - Edit team",
                    team: foundTeam
                });
       }
    });
});

// CREATE TEAM
router.post("/:leagueid/teams", (req, res) => {
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
router.put("/:leagueid/teams/:teamid", (req, res) => {
   Team.findByIdAndUpdate(req.params.teamid, {
       name: req.body.name,
       footballTeam: req.body.footballTeam
   }, function(err) {
       if (err) {
            res.render("error", { error: err });
       } else {
           var redirectUrl = "/leagues/" + req.params.leagueid + "/teams/" + req.params.teamid;
           res.redirect(redirectUrl);
       }
   });
});

// DELETE TEAM
router.delete("/:leagueid/teams/:teamid", (req, res) => {
    // remove team from database
    Team.findByIdAndRemove(req.params.teamid, async function (err, removedTeam) {
        if (err) {
            res.render("error", { error: err });
        } else {
            // remove reference to team from League team list
            console.log("removed team: " + removedTeam);
            await League.updateOne({_id: req.params.leagueid}, {$pullAll: {teams: [removedTeam._id] } }, function(err, result) {
                if (err) {
                    res.render("error", { error: err });
                } else {
                    console.log("Still works removedTeam: " + removedTeam);
                    // loop through each of the removed team's matches
                    removedTeam.matches.forEach(async function(match) {
                        console.log("forEach match id: " + match);
                        Match.findByIdAndRemove(match, function(err, removedMatch) {
                            if (err) {
                                res.render("error", { error: err });
                            } else {
                                console.log("Removed match: " + removedMatch);
                                // update other team's match list
                                var otherTeam;
                                if (req.params.teamid == removedMatch.homeTeam) {
                                    otherTeam = removedMatch.awayTeam;
                                } else { 
                                    otherTeam = removedMatch.homeTeam; 
                                }
                                Team.updateOne({_id: otherTeam}, {$pullAll: {matches: [removedMatch._id] } }
                                , function(err, result) {
                                    if (err) {
                                         res.render("error", { error: err });
                                    }
                                    console.log("Team update res: ");
                                    console.log(result);
                                    
                                });
                                League.updateOne({_id: req.params.leagueid}, {$pullAll: {matches: [removedMatch._id] } }, function(err, result) {
                                    if (err) {
                                        console.log(result);
                                         res.render("error", { error: err });
                                    }
                                    console.log("League upd res: ");
                                    console.log(result);
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
router.get("/new", (req, res) => {

    res.status(200).render("newLeague", {
        title: "League Wizard - Add new league"
    });

});

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
                res.status(200).render("showLeague", {
                    title: "League Wizard - Standings",
                    league: foundLeague,
                    moment: moment
                });
            }

        }
    });
});

// CREATE LEAGUE
router.post("/", (req, res) => {
    var newLeague = new League({
        name: req.body.name
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

// DELETE LEAGUE
router.delete("/:leagueid", (req, res) => {
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