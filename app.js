// app.js

/**
 * Required External Modules
 */

const express = require("express"),
      path    = require("path"),
      bodyParser = require('body-parser'),
      createError           = require('http-errors'),
      League = require("./models/league"),
      Match = require("./models/match"),
      Team = require("./models/team"),
      mongoose = require("mongoose"),
      cookieParser          = require('cookie-parser'),
      methodOverride        = require('method-override'),
      moment = require("moment"),
      { expressCspHeader, 
      SELF, NONCE } = require('express-csp-header');

/**
 * App Variables
 */

const app  = express(),
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
      catch(error => function(err){
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
    
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(methodOverride("_method"));
    
// CSP header
    app.use(expressCspHeader({
      directives: {
        'default-src': [SELF, NONCE, '*.google.com'],
        'script-src': [SELF, NONCE, 'code.jquery.com'],
        'style-src': [SELF, NONCE],
        'img-src': [SELF, NONCE],
        'font-src': [SELF, NONCE, '*.fontawesome.com']
      }
    }));
    
// Forward current user and nonce to each route
    app.use(function (req, res, next) {
      res.locals.currentUser = req.user;
      res.locals.nonce = req.nonce;
      next();
    });

/**
 * Routes Definitions
 */

// match routes
    app.get("/leagues/:leagueid/matches/new", (req, res) => {
        League.findById(req.params.leagueid).populate("teams").exec(function(err, foundLeague) {
            if (err) {
                res.render("error", {error: err});
            } else {
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
            await newMatch.save(function(err, match){
                if (err) {
                    res.render("error", {error: err});
                } else {
                    League.findById(req.params.leagueid).populate("teams").exec(async function(err, foundLeague) {
                    if (err) {
                        res.render("error", {error: err});
                    } else {
                        // insert match id into league's match list
                        foundLeague.matches.push(match._id);
                        // find home team to update
                        Team.findById(match.homeTeam).exec(async function(err, foundTeam) {
                            if (err) {
                                res.render("error", {error: err});
                            } else {
                                foundTeam.played += 1;
                                foundTeam.goalsfor += match.homeScore;
                                foundTeam.goalsagainst += match.awayScore;
                                if (match.homeScore > match.awayScore) {
                                    foundTeam.won += 1;
                                } else if (match.homeScore < match.awayScore) {
                                    foundTeam.lost += 1;
                                } else { 
                                    foundTeam.draw += 1; 
                                }
                                await foundTeam.save();
                            }
                        });
                        // find away team to update
                        Team.findById(match.awayTeam).exec(async function(err, foundTeam2) {
                            if (err) {
                                res.render("error", {error: err});
                            } else {
                                foundTeam2.played += 1;
                                foundTeam2.goalsfor += match.awayScore;
                                foundTeam2.goalsagainst += match.homeScore;
                                if (match.homeScore < match.awayScore) {
                                    foundTeam2.won += 1;
                                } else if (match.homeScore > match.awayScore) {
                                    foundTeam2.lost += 1;
                                } else { 
                                    foundTeam2.draw += 1; 
                                }
                                await foundTeam2.save();
                            }
                        });
                        // sort according to league rules
                        foundLeague.teams.sort(function(teamA, teamB){
                            var teamApoints = teamA.won * 3 + teamA.draw;
                            var teamBpoints = teamB.won * 3 + teamB.draw;
                            var teamAGD = teamA.goalsfor - teamA.goalsagainst;
                            var teamBGD = teamB.goalsfor - teamB.goalsagainst;
                            if (teamApoints > teamBpoints) {
                                return -1;
                            } else if (teamApoints < teamBpoints) {
                                return 1;
                            } else if (teamAGD > teamBGD) {
                                return -1;
                            } else if (teamAGD <teamBGD) {
                                return 1;
                            } else if (teamA.goalsfor > teamB.goalsfor) {
                                return -1;
                            }
                            else if (teamA.goalsfor < teamB.goalsfor) {
                                return 1;
                            }
                            else return 0;
                        });
                        
                        // update positions and each team and save them
                        for (var i = 0; i < foundLeague.teams.length; i++) {
                            foundLeague.teams[i].position = i + 1;
                            await foundLeague.teams[i].save();
                        }
                        
                        //save changes in league and redirect
                        foundLeague.save(function(err) {
                            if (err) {
                                res.render("error", {error: err});
                            } else {
                                var redirectUrl = "/leagues/" + req.params.leagueid;
                                return res.redirect(redirectUrl);
                            }
                        });
                    }
                    });
                }
            });
        } else {
            var redirectUrl = "/leagues/" + req.params.leagueid + "/matches/new";
            return res.redirect(redirectUrl);
        }
       
    });
    
// team routes
    app.get("/leagues/:leagueid/teams/:teamid", (req, res) => {
        League.findById(req.params.leagueid).populate("teams").populate("matches").exec(function(err, foundLeague) {
            if (err) {
                res.render("error", {error: err});
            } 
            else {
                if (foundLeague === undefined || foundLeague === null) {
                    res.redirect("/leagues");
                } 
                else {
                    Team.findById(req.params.teamid).exec(function(err, foundTeam){
                        if (err) {
                            res.render("error", {error: err});
                        } else {
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
    
    app.get("/leagues/:leagueid/teams/new", (req, res) => {
        
        res.status(200).render("newTeam", {
            title: "League Wizard - Add team to league"
        });
        
    });
    
    app.post("/leagues/:leagueid/teams", (req, res) => {
        
       res.status(200).send("new team POST reached");
       
    });

// league routes
    
    app.get("/leagues", (req, res) => {
        res.redirect("/");
    });
    
    app.get("/leagues/:id", (req, res) => {
        League.findById(req.params.id).populate("teams").populate("matches").exec(function(err, foundLeague) {
            if (err) {
                res.render("error", {error: err});
            } else {
                if (foundLeague === undefined || foundLeague === null) {
                    res.redirect("/leagues");
                    
                } else {
                    res.status(200).render("showLeague", {
                        title: "League Wizard - Standings",
                        league: foundLeague,
                        moment: moment
                    });
                }
                
            }
        });
    });
    
// index route
    app.get("/", (req, res) => {
        
        res.status(200).render("index", {
            title: "League Wizard"
        });
        
    });

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
      res.render("error", {error: error});
    });

/**
 * Server Activation
 */
 
 
    app.listen(port, () => {
         
        console.log(`Listening to requests on port ${port}`);
         
    });
 
 console.log("app launched successfully");