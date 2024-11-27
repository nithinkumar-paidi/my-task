
// models/feedback.js
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  submissionId: { type: String, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String },
  feedback: { type: String },
  fcmToken: { type: String },
  notificationStatus: { 
    type: String, 
    enum: ['Pending', 'Sent', 'Failed', 'Not Sent'],
    default: 'Not Sent' 
  },
  scheduledTime: { type: Date },
  sentTime: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);