const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const findOrCreate = require('mongoose-find-or-create')

const UserSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true
    },
    playerId: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },
    expirationDate: {
        type: Date,
        default: Date.now()
    },
    trialUsed: {
        type: Boolean,
        default: false
    },
    username: {
        type: String,
        required: true
    }
});

UserSchema.plugin(uniqueValidator)
UserSchema.plugin(findOrCreate)

const DiscordUser = module.exports = mongoose.model('User', UserSchema);