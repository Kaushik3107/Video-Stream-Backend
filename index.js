const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const videoRoutes = require('./routes/videoRoutes'); 

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Replace with your Angular app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json({ limit: '50mb' })); // Increase the limit for JSON payloads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Increase the limit for URL-encoded payloads

// Routes
app.use("/api/users", userRoutes);
app.use('/api', videoRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
