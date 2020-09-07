'use strict';
var mongoose    = require('mongoose'),
    User    = require('./user'),
    idValidator = require('mongoose-id-validator');

var tokenSchema = new mongoose.Schema({
    _userId: {
        type: mongoose.Schema.Types.Object,
        required: true,
        ref: "User"
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    tokenType: String,
    inviteEmail: String
});

// verification token expires after 12 hours
tokenSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 43200 });

tokenSchema.plugin(idValidator);

module.exports = mongoose.model("Token", tokenSchema);