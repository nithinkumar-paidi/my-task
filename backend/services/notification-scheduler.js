
// services/notification-scheduler.js
const cron = require('node-cron');
const Feedback = require('../models/feedback');
const { sendNotification } = require('./firebase-notification-service');

class NotificationScheduler {
  async processScheduledNotifications() {
    try {
      console.log('Checking for notifications at:', new Date().toISOString());
      
      const pendingNotifications = await Feedback.find({
        notificationStatus: { $in: ['Scheduled', 'Pending'] },
        scheduledTime: { $lte: new Date() },
        fcmToken: { $exists: true, $ne: null }
      }).sort({ scheduledTime: 1 });

      console.log(`Found ${pendingNotifications.length} notifications to process`);

      for (const notification of pendingNotifications) {
        try {
          const { fcmToken, name, _id } = notification;
          
          await Feedback.updateOne(
            { _id },
            { notificationStatus: 'Processing' }
          );

          const response = await sendNotification(
            fcmToken,
            "Special Offer!",
            `Hello ${name}, enjoy a 30% discount on your next visit!`,
            {
              promotionCode: "DISCOUNT30",
            //   validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
               validTill: new Date(Date.now() + 1 * 60 * 1000).toISOString(),


            }
          );

          await Feedback.updateOne(
            { _id },
            {
              notificationStatus: 'Success',
              sentTime: new Date(),
              processedAt: new Date()
            }
          );
          console.log(` Notification sent successfully to ${name}`);
        } catch (error) {
          console.error(` Failed for ${notification.name}:`, error);
          await Feedback.updateOne(
            { _id: notification._id },
            { 
              notificationStatus: 'Failed',
              errorMessage: error.message,
              processedAt: new Date()
            }
          );
        }
      }
    } catch (error) {
      console.error('Error in notification processor:', error);
    }
  }

  start() {
    console.log('Starting notification scheduler...');
    cron.schedule('*/30 * * * * *', () => {
      this.processScheduledNotifications();
    });
  }
}

module.exports = new NotificationScheduler();