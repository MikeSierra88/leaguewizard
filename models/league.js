const mongoose = require("mongoose"),
      Team     = require("./team"),
      Match    = require("./match"),
      User     = require("./user");
      
var leagueSchema = new mongoose.Schema({
    name: String,
    teams: [{
        type:mongoose.Schema.Types.ObjectID,
        ref: "Team"
    }],
    matches: [{
        type:mongoose.Schema.Types.ObjectID,
        ref: "Match"
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "User"
    }, // LATER DEV
    // admins: [{
    //     type: mongoose.Schema.Types.ObjectID,
    //     ref: "User"
    // }],
    players: [{
        playerId: {
            type: mongoose.Schema.Types.ObjectID,
            ref: "User"
        },
        playerTeamId: {
            type:mongoose.Schema.Types.ObjectID,
            ref: "Team"
        }
    }]
});

module.exports = new mongoose.model("League", leagueSchema)