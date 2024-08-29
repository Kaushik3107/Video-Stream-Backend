const fs = require('fs');
const path = require('path');
const Video = require('../models/video');

// Upload a new video
const uploadVideo = async (req, res) => {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const videoPath = path.join('uploads', file.filename);

    try {
        const video = new Video({
            title,
            description,
            filename: file.filename,
            path: videoPath,
            contentType: file.mimetype,
        });

        await video.save();

        res.status(201).json({
            message: 'Video uploaded successfully',
            video,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Stream video by ID
const streamVideo = async (req, res) => {
    const { id } = req.params;

    try {
        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const videoPath = path.join(__dirname, '..', video.path);

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;

            const file = fs.createReadStream(videoPath, { start, end });

            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': video.contentType,
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': video.contentType,
            };

            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { uploadVideo, streamVideo };
