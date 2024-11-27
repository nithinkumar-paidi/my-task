const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountKeyPath = path.join(__dirname, '../config/service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountKeyPath)),
  databaseURL: "https://your-firebase-database-url.firebaseio.com"  // Replace with your Firebase Realtime Database URL
});

const sendNotification = async (fcmToken, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      token: fcmToken
    };

    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

module.exports = { sendNotification };
