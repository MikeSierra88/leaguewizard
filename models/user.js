'use strict';
var mongoose              = require('mongoose'),
    League                = require("./league"),
    passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
   email: { 
       type: String, 
       unique: true
   },
   playerName: String,
   password: String,
   isVerified: {
       type: Boolean,
       default: false
   },
   favoriteLeagues: [{
       type: mongoose.Schema.Types.ObjectID,
       ref: "League"
   }]
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
});

module.exports = mongoose.model('User', userSchema);