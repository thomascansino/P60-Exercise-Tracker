const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add the user name"],
        unique: [true, "Username is already taken"],
    },
});

module.exports = mongoose.model('User', userSchema);