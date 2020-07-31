// Middlewares
var { param, check, validationResult } = require('express-validator');

var middlewareObj = {};

// reCAPTCHA middleware for login
middlewareObj.captchaPassed = function(req,res,next){
  if(req.body['g-recaptcha-response'] === undefined || 
      req.body['g-recaptcha-response'] === '' || 
      req.body['g-recaptcha-response'] === null)
  {
    return res.json({"responseError" : "something goes wrong"});
  }
  
  var secretKey = process.env.LEAGUE_RECAPTCHA_SECRET;
  var verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.LEAGUE_RECAPTCHA_SECRET + "&response=" + req.body['g-recaptcha-response'];
  /*global fetch*/
  fetch(verificationURL, {method: 'post'})
    .then(response => response.json())
    .then(google_response => {
      console.log(google_response);
      if (google_response.success) {
        next();
      } else {
        res.redirect("/login");
      }
    })
    .catch(error => res.render("error", { error: error }));
};

// Auth middleware to check if user is logged in
middlewareObj.isLoggedIn = function(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
};

middlewareObj.userRegisterValidation = async function(req,res,next){
    await check('username').trim().escape().isLength({ min: 3}).run(req);
    await check('password').trim().escape().matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,64}$/, "g").run(req);
    
    var result = validationResult(req);
    if (!result.isEmpty()) {
      console.log(result);
      return res.status(422).json({ errors: result.array() });
    }
    next();
};

middlewareObj.userLoginValidation = async function(req,res,next){
    await check('username').trim().escape().run(req);
    await check('password').trim().escape().run(req);
    
    var result = validationResult(req);
    if (!result.isEmpty()) {
      console.log(result);
      return res.status(422).json({ errors: result.array() });
    }
    next();
};

middlewareObj.teamValidation = async function(req, res, next) {
  await check('name').trim().escape().run(req);
  await check('footballTeam').trim().escape().run(req);
  
  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
}

middlewareObj.leagueValidation = async function(req, res, next) {
  await check('name').trim().escape().run(req);
  
  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
}

middlewareObj.matchValidation = async function(req, res, next) {
  await check('homeScore').trim().escape().isInt().run(req);
  await check('awayScore').trim().escape().isInt().run(req);
  
  var result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return res.status(422).json({ errors: result.array() });
  }
  next();
}

module.exports = middlewareObj;