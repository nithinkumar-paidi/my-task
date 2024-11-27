
// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');
const bodyParser = require("body-parser");
const connectDB = require('./config/db');
const notificationsRoutes = require("./routes/notificationsRoutes");
const feedbackRoutes = require('./routes/feedbackRoutes');
const notificationScheduler = require('./services/notification-scheduler');
const { syncGoogleSheetsData } = require('./services/firebase-google-sheets');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected successfully");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err.message);
});

// Schedule Google Sheets sync every 5 minutes
cron.schedule('*/2 * * * *', async () => {
  console.log('Running Google Sheets sync at:', new Date().toISOString());
  try {
    await syncGoogleSheetsData();
  } catch (error) {
    console.error('Error syncing Google Sheets data:', error);
  }
});

// Routes
app.use("/api/notifications", notificationsRoutes);
app.use('/api', feedbackRoutes);

 // Start notification scheduler after DB connection
 notificationScheduler.start();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});