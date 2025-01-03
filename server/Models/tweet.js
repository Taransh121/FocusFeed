const mongoose = require('mongoose');

// Define the schema for the Tweet model
const tweetSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    }
}, { timestamps: true });

// Create the model from the schema
module.exports = mongoose.model('Tweet', tweetSchema);
