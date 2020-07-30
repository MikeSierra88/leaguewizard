// app.js

/**
 * AWS Variables
 */
 
var AWS        = require('aws-sdk'),
    region     = "eu-central-1",
    secretName = process.env.AWS_SECRET_NAME,
    secret,
    decodedBinarySecret;

/**
 * AWS Secret Manager
 */
 
// Create a Secrets Manager client
var client = new AWS.SecretsManager({
    region: region
});

client.getSecretValue({SecretId: secretName}, function(err, data) {
    if (err) {
        if (err.code === 'DecryptionFailureException')
            // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InternalServiceErrorException')
            // An error occurred on the server side.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidParameterException')
            // You provided an invalid value for a parameter.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidRequestException')
            // You provided a parameter value that is not valid for the current state of the resource.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'ResourceNotFoundException')
            // We can't find the resource that you asked for.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
    }
    else {
        // Decrypts secret using the associated KMS CMK.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
            secret = data.SecretString;
        } else {
            let buff = new Buffer(data.SecretBinary, 'base64');
            decodedBinarySecret = buff.toString('ascii');
        }
    }
    
    const CREDENTIALS = JSON.parse(secret);
    process.env.LEAGUE_RECAPTCHA_SECRET = CREDENTIALS.LEAGUE_RECAPTCHA_SECRET;
    
    /**
     * Required External Modules
     */
    
    const express               = require('express'),
          path                  = require('path'),
          cors                  = require('cors'),
          bodyParser            = require('body-parser'),
          createError           = require('http-errors'),
          mongoose              = require('mongoose'),
          logger                = require('morgan'),
          passport              = require('passport'),
          LocalStrategy         = require('passport-local'),
          passportLocalMongoose = require('passport-local-mongoose'),
          fetch                 = require('isomorphic-fetch'),
          User                  = require('./models/user'),
          cookieParser          = require('cookie-parser'),
          methodOverride        = require('method-override'),
          indexRouter           = require('./routes/routes'),
          leagueRouter          = require('./routes/leagues'),
          authRouter            = require('./routes/auth'),
          {
            expressCspHeader,
            SELF,
            NONCE
          } = require('express-csp-header');

    /**
     * App Variables
     */
    
    const app  = express(),
          port = 8082;
    
    /**
     *  App Configuration
     */
    // connect to database using mongoose
    
    // production DB
    const LEAGUEDB_URI = CREDENTIALS.LEAGUEDB + '?retryWrites=true&w=majority';
    
    // development DB
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
    
    // initialize express-session
    app.use(require("express-session")({
      secret: CREDENTIALS.LEAGUE_SESSION_SECRET, // production secret
    //   secret: process.env.SESSION_SECRET;     // development secret
      resave: false,
      saveUninitialized: false
    }));
    
    // initialize passport
    app.use(logger('dev'));
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    
    // view engine setup
    
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");
    
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(methodOverride("_method"));
    
    // static folders
    app.use(express.static(path.join(__dirname, 'public')));
    app.use("/bootstrap", express.static(path.join(__dirname, '/node_modules/bootstrap/dist')));
    app.use("/jquery", express.static(path.join(__dirname, '/node_modules/jquery/dist')));
    app.use("/popper", express.static(path.join(__dirname, '/node_modules/popper.js/dist')));
    
    
    // CSP header and CORS
    app.use(expressCspHeader({
        directives: {
            'default-src': [SELF, NONCE, '*.google.com'],
            'script-src': [SELF, NONCE, 'cdn.datatables.net', '*.fontawesome.com', '*.google.com'],
            'style-src': [SELF, NONCE, 'cdn.datatables.net', '*.fontawesome.com'],
            'img-src': [SELF, NONCE, 'cdn.datatables.net'],
            'font-src': [SELF, NONCE, '*.fontawesome.com']
        }
    }));

    app.use(cors());
    
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
    app.use(authRouter);
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

});