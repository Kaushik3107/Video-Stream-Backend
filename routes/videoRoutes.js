// const express = require('express');
// const multer = require('multer');
// const mongoose = require('mongoose');
// const Video = require('../models/video'); // Adjust the path as needed
// const router = express.Router();


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

// router.post('/api/videos', upload.single('video'), async (req, res) => {
//   try {
//     const video = new Video({
//       title: req.body.title,
//       description: req.body.description,
//       filePath: req.file.path,
//       userId: req.user.id // Assuming you have user authentication and req.user contains the logged-in user
//     });
//     await video.save();
//     res.status(201).send(video);
//   } catch (error) {
//     res.status(400).send({ error: 'Failed to upload video' });
//   }
// });

// router.get('/api/videos', async (req, res) => {
//   try {
//     const videos = await Video.find({ userId: req.user.id }); // Fetching videos specific to the logged-in user
//     res.send(videos);
//   } catch (error) {
//     res.status(500).send({ error: 'Failed to fetch videos' });
//   }
// });

// module.exports = router;

const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Video = require('../models/video'); // Adjust the path as needed
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route for uploading a video
router.post('/api/videos', upload.single('video'), async (req, res) => {
  try {
    const video = new Video({
      title: req.body.title,
      description: req.body.description,
      filePath: req.file.path,
      userId: req.user.id // Assuming you have user authentication and req.user contains the logged-in user
    });
    await video.save();
    res.status(201).send(video);
  } catch (error) {
    res.status(400).send({ error: 'Failed to upload video' });
  }
});

// Route for fetching all videos of a user
router.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.user.id }); // Fetching videos specific to the logged-in user
    res.send(videos);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch videos' });
  }
});

// Route for streaming a video
router.get('/api/videos/stream/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).send({ error: 'Video not found' });
    }

    const videoPath = path.resolve(video.filePath);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).send({ error: 'Failed to stream video' });
  }
});

module.exports = router;
