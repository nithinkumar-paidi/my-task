const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const feedbackService = require('../services/feedback-service');

// Route to add feedback
router.post('/add-feedback', async (req, res) => {
    try {
        const feedbackData = new Feedback(req.body);
        const result = await feedbackData.save();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    console.log('Feedback Data:', req.body);

});
// Route to get all feedback
router.get('/get-feedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).json({ success: true, data: feedbacks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    console.log('Feedbacks Retrieved:', feedbacks);

});
// Route to sync feedback
router.get('/sync-feedback', async (req, res) => {
    try {
      await feedbackService.syncFeedback();
      res.status(200).json({ success: true, message: 'Feedback sync completed.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error syncing feedback.' });
    }
  });

  // Route to handle new feedback submission
router.post("/submit", async (req, res) => {
    try {
      // Capture the feedback data from the request body
      const feedbackData = {
        submissionId: new Date().toLocaleString(), // You can generate the submission ID dynamically
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email || null,
        feedback: req.body.feedback,
        fcmToken: req.body.fcmToken || null, // FCM token can be optional
      };
  
      // Create a new Feedback instance
      const feedback = new Feedback(feedbackData);
  
      
      // Save the feedback to the database
      await feedback.save();
  
      res.status(200).json({
        success: true,
        message: "Feedback submitted successfully",
      });
    } catch (error) {
      console.error("Error saving feedback:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit feedback",
        error: error.message,
      });
    }
  });
  


module.exports = router;
