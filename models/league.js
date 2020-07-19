const mongoose = require("mongoose"),
      Team = require("./team"),
      Match    = require("./match");
      
var leagueSchema = new mongoose.Schema({
    name: String,
    teams: [{
        type:mongoose.Schema.Types.ObjectID,
        ref: "Team"
    }],
    matches: [{
        type:mongoose.Schema.Types.ObjectID,
        ref: "Match"
    }]
});

module.exports = new mongoose.model("League", leagueSchema)