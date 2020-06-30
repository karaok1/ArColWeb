const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const findOrCreate = require('mongoose-find-or-create')
const today = new Date()
const endDate = new Date(today)
endDate.setDate(endDate.getDate() + 2)

const UserSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: false
    },
    hWID: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
    },
    expirationDate: {
        type: Date,
        required: true,
        sparse: true
    },
    timeStamp: {
        type: Date,
        required: false
    }
});

UserSchema.plugin(uniqueValidator)
UserSchema.plugin(findOrCreate)

const LicenseUser = module.exports = mongoose.model('User', UserSchema);