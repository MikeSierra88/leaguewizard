const mongoose = require("mongoose"),
      League = require("./league"),
      Team     = require("./team");

var matchSchema = new mongoose.Schema({
    league: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "League",
        required: true
    },
    homeTeam: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "Team",
        required: true
    },
    awayTeam: {
        type:mongoose.Schema.Types.ObjectID,
        ref: "Team",
        required: true
    },
    homeScore: Number,
    awayScore: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = new mongoose.model("Match", matchSchema);