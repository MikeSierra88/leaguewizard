// app.js

/**
 * Required External Modules
 */

const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    createError = require('http-errors'),
    mongoose = require('mongoose'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    indexRouter = require('./routes/routes'),
    leagueRouter = require('./routes/leagues'),
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
 * Routers
 */
 
app.use("/leagues", leagueRouter);

app.use("/", indexRouter);

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
