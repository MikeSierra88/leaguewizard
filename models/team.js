const mongoose = require("mongoose");

var teamSchema = new mongoose.Schema({
    league: {
        type:mongoose.Schema.Types.ObjectID,
        ref: "League",
        required: true
    },
    name: {type: String, required: true},
    footballTeam: {type: String, required: true},
    played: {type: Number, default: 0},
    won: {type: Number, default: 0},
    draw: {type: Number, default: 0},
    lost: {type: Number, default: 0},
    goalsfor: {type: Number, default: 0},
    goalsagainst: {type: Number, default: 0}
});

module.exports = new mongoose.model("Team", teamSchema);