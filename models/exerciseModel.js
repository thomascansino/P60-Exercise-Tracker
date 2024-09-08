const mongoose = require('mongoose');

const exerciseSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    description: {
        type: String,
        required: [true, "Please add what exercise"],
    },
    duration: {
        type: Number,
        required: [true, "Please add the duration in minutes"],
    },
    date: {
        type: Date,
    },
});

module.exports = mongoose.model('Exercise', exerciseSchema);