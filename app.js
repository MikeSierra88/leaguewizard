// app.js

/**
 * Required External Modules
 */

const express = require("express"),
    path = require("path"),
    bodyParser = require('body-parser'),
    createError = require('http-errors'),
    League = require("./models/league"),
    Match = require("./models/match"),
    Team = require("./models/team"),
    mongoose = require("mongoose"),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    moment = require("moment"),
    {
        expressCspHeader,
        SELF,
        NONCE
    } = require('express-csp-header');

/**
 * App Variables
 */

const app = express(),
    port = process.env.PORT || "8000";

/**
 *  App Configuration
 */

// connect to database using mongoose

const LEAGUEDB_URI = process.env.LEAGUEDB + '?retryWrites=true&w=majority';

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(LEAGUEDB_URI).
catch(error => function(err) {
    console.log(err.reason);
});

const db = mongoose.connection;
db.once('open', function() {
    console.log('DB connected');
    // Seed test data into database
    // require('./models/seedData');
});

// view engine setup

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));

// CSP header
app.use(expressCspHeader({
    directives: {
        'default-src': [SELF, NONCE, '*.google.com'],
        'script-src': [SELF, NONCE, 'code.jquery.com', 'cdn.datatables.net'],
        'style-src': [SELF, NONCE, 'cdn.datatables.net'],
        'img-src': [SELF, NONCE, 'cdn.datatables.net'],
        'font-src': [SELF, NONCE, '*.fontawesome.com']
    }
}));

// Forward current user and nonce to each route
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.nonce = req.nonce;
    next();
});

/**
 * Routes Definitions
 */

/**
 * MATCH ROUTES
 */
 
// NEW MATCH FORM
app.get("/leagues/:leagueid/matches/new", (req, res) => {
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
app.get("/leagues/:leagueid/matches/:matchid/edit", (req, res) => {
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
app.post("/leagues/:leagueid/matches", async function(req, res) {
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
app.put("/leagues/:leagueid/matches/:matchid", (req, res) => {
    // TODO LOGIC
    // GOT TO UPDATE TEAMS TOO!
    
    res.json(req.body);
});

// DELETE MATCH
app.delete("/leagues/:leagueid/matches/:matchid", (req, res) => {
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
app.get("/leagues/:leagueid/teams/new", (req, res) => {
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
app.get("/leagues/:leagueid/teams/:teamid", (req, res) => {

    League.findById(req.params.leagueid).populate("teams").populate("matches").exec(function(err, foundLeague) {
        if (err) {
            res.render("error", { error: err });
        }
        else {
            if (foundLeague === undefined || foundLeague === null) {
                res.redirect("/leagues");
            }
            else {
                Team.findById(req.params.teamid).exec(function(err, foundTeam) {
                    if (err) {
                        res.render("error", { error: err });
                    }
                    else {
                        if (foundTeam === undefined || foundTeam === null) {
                            console.log("Team not found");
                            var leagueUrl = "/leagues/" + foundLeague._id;
                            res.redirect(leagueUrl);
                        }
                        else {
                            res.status(200).render("showTeam", {
                                title: "League Wizard - Standings",
                                league: foundLeague,
                                team: foundTeam,
                                moment: moment
                            });
                        }
                    }
                });

            }
        }
    });

});

// EDIT TEAM FORM
app.get("/leagues/:leagueid/teams/:teamid/edit", (req, res) => {
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
app.post("/leagues/:leagueid/teams", (req, res) => {
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
app.put("/leagues/:leagueid/teams/:teamid", (req, res) => {
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
app.delete("/leagues/:leagueid/teams/:teamid", (req, res) => {
    Team.findByIdAndRemove(req.params.teamid, function (err, removedTeam) {
        if (err) {
            res.render("error", { error: err });
        } else {
            removedTeam.matches.forEach(async function(match) {
                await Match.findByIdAndRemove(match._id, function(err, removedMatch) {
                    if (err) {
                        res.render("error", { error: err });
                    } else {
                        League.updateOne({_id: removedMatch.league}, {$pullAll: {matches: [removedMatch._id] } }, function(err) {
                            if (err) {
                                 res.render("error", { error: err });
                            }
                        });
                    }
                });
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
app.get("/leagues", (req, res) => {
    res.redirect("/");
});

// NEW LEAGUE FORM
app.get("/leagues/new", (req, res) => {

    res.status(200).render("newLeague", {
        title: "League Wizard - Add new league"
    });

});

// SHOW LEAGUE
app.get("/leagues/:id", (req, res) => {
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
app.post("/leagues", (req, res) => {
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
app.delete("/leagues/:leagueid", (req, res) => {
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

// index route
app.get("/", (req, res) => {
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

app.get("*", (req, res) => {
    res.redirect("/");
})

/**
 * Error Handling
 */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    var error = err;
    res.render("error", { error: error });
});

/**
 * Server Activation
 */


app.listen(port, () => {

    console.log(`Listening to requests on port ${port}`);

});

console.log("app launched successfully");
