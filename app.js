// app.js

/**
 * Required External Modules
 */

const express = require("express"),
      path    = require("path"),
      bodyParser = require('body-parser'),
      createError           = require('http-errors'),
      League = require("./models/league"),
      mongoose = require("mongoose"),
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
    app.use(express.static(path.join(__dirname, 'public')));
    
// CSP header
    app.use(expressCspHeader({
      directives: {
        'default-src': [SELF, NONCE, '*.google.com'],
        'script-src': [SELF, NONCE, 'cdnjs.cloudflare.com'],
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
        
        res.status(200).render("newMatch", {
            title: "League Wizard - Add Match"
        });
        
    });
    
    app.post("/leagues/:leagueid/matches", (req, res) => {
        
       res.status(200).send("new match POST reached");
       
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
                    var foundTeam = foundLeague.teams.filter(function(team){
                        return team._id == req.params.teamid;
                    }).toObject();
                    if (foundTeam === undefined || foundTeam === null) {
                        console.log("Team not found");
                        var leagueUrl = "/leagues/" + foundLeague._id;
                        res.redirect(leagueUrl);
                    }
                    else {
                        res.status(200).render("showTeam", {
                            title: "League Wizard - Standings",
                            league: foundLeague,
                            team: foundTeam[0],
                            moment: moment
                        });
                    }
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