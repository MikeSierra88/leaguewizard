// index.js

/**
 * Required External Modules
 */

const express = require("express"),
      path    = require("path"),
      bodyParser = require('body-parser'),
      createError           = require('http-errors'),
      mongoose = require("mongoose"),
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
    app.get("/league/match/new", (req, res) => {
        
        res.status(200).render("newMatch", {
            title: "League Wizard - Add Match"
        });
        
    });
    
    app.post("/league/match", (req, res) => {
        
       res.status(200).send("new match POST reached");
       
    });
    
// team routes
    app.get("/league/team", (req, res) => {
        
        res.status(200).render("showTeam", {
            title: "League Wizard - Team details"
        });
        
    });
    
    app.get("/league/team/new", (req, res) => {
        
        res.status(200).render("newTeam", {
            title: "League Wizard - Add team to league"
        });
        
    });
    
    app.post("/league/team", (req, res) => {
        
       res.status(200).send("new team POST reached");
       
    });

// league routes
    app.get("/league", (req, res) => {
        
        res.status(200).render("showLeague", {
            title: "League Wizard - Standings"
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
      res.render("error.ejs", {error: error});
    });

/**
 * Server Activation
 */
 
 
    app.listen(port, () => {
         
        console.log(`Listening to requests on port ${port}`);
         
    });
 
 console.log("app launched successfully");