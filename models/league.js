'use strict';
const mongoose    = require("mongoose"),
      idValidator = require('mongoose-id-validator'),
      Team        = require("./team"),
      Match       = require("./match"),
      User        = require("./user");
      
var leagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: "Team"
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: "Match"
    }],
    matchQueue: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: "Match"
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "User",
        required: true
    },
    date:  {
        type: Date,
        default: Date.now
    }
    
    // LATER DEV
    // admins: [{
    //     type: mongoose.Schema.Types.ObjectID,
    //     ref: "User"
    // }],
    // players: [{
    //     playerId: {
    //         type: mongoose.Schema.Types.ObjectID,
    //         ref: "User"
    //     },
    //     playerTeamId: {
    //         type:mongoose.Schema.Types.ObjectID,
    //         ref: "Team"
    //     }
    // }]
});

leagueSchema.plugin(idValidator);

module.exports = new mongoose.model("League", leagueSchema)