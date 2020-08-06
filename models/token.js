var mongoose              = require('mongoose');

var tokenSchema = new mongoose.Schema({
    _userId: {
        type: mongoose.Schema.Types.Object,
        required: true,
        ref: "user"
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 43200 // verification token expires after 12 hours
    }
});

module.exports = mongoose.model("Token", tokenSchema);