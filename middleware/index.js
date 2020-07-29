// Middlewares
var { param, check, validationResult } = require('express-validator');

var middlewareObj = {};

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

module.exports = middlewareObj;