const { google } = require('googleapis');
const { authenticateGoogle } = require('../config/google-auth');
const Feedback = require('../models/feedback');
const { sendNotification } = require('./firebase-notification-service');  // Assuming this function sends FCM notifications

class FeedbackService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.setupGoogleAuth();
  }

  async setupGoogleAuth() {
    try {
      this.auth = await authenticateGoogle();
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    }
  }

  async syncFeedback() {
    try {
      if (!this.sheets) {
        await this.setupGoogleAuth();
      }

      console.log(`Starting feedback sync at ${new Date().toISOString()}`);

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        range: process.env.GOOGLE_SHEET_RANGE || 'Form Responses 1!A2:Z',
      });

      const rows = response.data.values;
      console.log('Fetched rows:', rows);  // Add this line to log the rows

      if (!rows || rows.length === 0) {
        console.log('No data found in spreadsheet');
        return;
      }

      for (const row of rows) {
        console.log('Row data:', row);  // Log to check the actual data in each row

        // Assuming the first column (A) has the submission ID
        const submissionId = row[0];

        // Check if the feedback already exists by submissionId
        const existingFeedback = await Feedback.findOne({ submissionId });
        console.log('Existing feedback:', existingFeedback);

        // If the feedback doesn't exist, create a new one
        if (!existingFeedback) {
          const feedbackData = {
            submissionId,
            name: row[1],
            phoneNumber: row[2],
            email: row[3],
            feedback: row[4],
            fcmToken: row[5] || null,  // Assuming FCM token is in the 6th column
          };

          const feedback = new Feedback(feedbackData);
          await feedback.save();
          console.log('Feedback inserted:', feedbackData);

          // Send notification if FCM token is available
          if (feedback.fcmToken) {
            await sendNotification(
              feedback.fcmToken,
              'Exclusive Offer!',
              `Hi ${feedback.name}, enjoy a 30% discount on your next order!`,
              { offerId: 'DISCOUNT30' }
            );
            console.log(`Notification sent to ${feedback.name}`);
          }
        }
      }

      console.log(`Completed sync at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Sync error:', error.message);
      throw error;
    }
  }
}

module.exports = new FeedbackService();
