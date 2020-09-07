const mongoose = require("mongoose"),
      idValidator = require('mongoose-id-validator'),
      League   = require("./league"),
      User     = require("./user"),
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
        type: mongoose.Schema.Types.ObjectID,
        ref: "Team",
        required: true
    },
    homeScore: Number,
    awayScore: Number,
    date: {
        type: Date,
        default: Date.now
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "User",
        required: true
    }
});

matchSchema.plugin(idValidator);

module.exports = new mongoose.model("Match", matchSchema);