const mongoose = require("mongoose");

var teamSchema = new mongoose.Schema({
    league: {
        type:mongoose.Schema.Types.ObjectID,
        ref: "League",
        required: true
    },
    name: String,
    footballTeam: String,
    position: Number,
    played: Number,
    won: Number,
    draw: Number,
    lost: Number,
    goalsfor: Number,
    goalsagainst: Number
});

module.exports = new mongoose.model("Team", teamSchema);