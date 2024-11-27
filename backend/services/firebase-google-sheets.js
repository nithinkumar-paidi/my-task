
     // firebase-google-sheets.js
const admin = require('firebase-admin');
const { google } = require('googleapis');
const path = require('path');
const Feedback = require('../models/feedback');
const { sendNotification } = require('./firebase-notification-service');
const mongoose = require('mongoose')

const serviceAccountKeyPath = path.join(__dirname, '../config/service-account-key.json');

const auth = new google.auth.GoogleAuth({
  keyFile: serviceAccountKeyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const getGoogleSheetsData = async (spreadsheetId, range) => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  try {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return response.data.values;
  } catch (error) {
    console.error('Error reading from Google Sheets:', error.message);
    throw error;
  }
};

const syncGoogleSheetsData = async () => {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const range = 'Form Responses 1!A2:E';

  try {
    const data = await getGoogleSheetsData(spreadsheetId, range);
    
    for (const row of data) {
      const [timestamp, name, phoneNumber, email, feedback] = row;
      
      // Check if entry already exists
      const existingFeedback = await Feedback.findOne({ 
        name,
        phoneNumber,
        email 
      });

      if (!existingFeedback) {
        // Create new feedback entry
        const newFeedback = new Feedback({
          submissionId: new mongoose.Types.ObjectId(),
          name,
          phoneNumber,
          email,
          feedback,
          notificationStatus: 'Pending'
        });

        await newFeedback.save();
        console.log(`Saved new feedback from ${name}`);

        // Send welcome notification if fcmToken exists
        if (newFeedback.fcmToken) {
          try {
            await sendNotification(
              newFeedback.fcmToken,
              'Welcome!',
              `Thank you for your feedback, ${name}!`,
              { type: 'welcome' }
            );
            await Feedback.updateOne(
              { _id: newFeedback._id },
              { notificationStatus: 'Sent' }
            );
          } catch (error) {
            console.error(`Failed to send welcome notification to ${name}:`, error);
            await Feedback.updateOne(
              { _id: newFeedback._id },
              { notificationStatus: 'Failed' }
            );
          }
        }
      }
    }
    console.log('Google Sheets sync completed successfully');
  } catch (error) {
    console.error('Error syncing Google Sheets data:', error);
    throw error;
  }
};

module.exports = { getGoogleSheetsData, syncGoogleSheetsData };