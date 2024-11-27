// File: config/google-auth.js
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const authenticateGoogle = () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../config/service-account-key.json'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/forms.responses.readonly'
      ]
    });
    return auth;
  } catch (error) {
    console.error('Google authentication error:', error);
    throw error;
  }
};

module.exports = { authenticateGoogle };