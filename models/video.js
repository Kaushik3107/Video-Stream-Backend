const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    contentType: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', videoSchema);
