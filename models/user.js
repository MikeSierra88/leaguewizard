var mongoose              = require('mongoose'),
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
   }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
});

module.exports = mongoose.model('User', userSchema);