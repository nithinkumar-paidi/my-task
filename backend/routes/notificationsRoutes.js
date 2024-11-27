// const express = require("express");
// const router = express.Router();
// const admin = require("../services/firebase-google-sheets");
// const Feedback = require("../models/feedback");
// const { sendNotification } = require("../services/firebase-notification-service"); // Import the notification service

// // Endpoint to send promotional notifications
// router.post("/send-promotion", async (req, res) => {
//   try {
//     // Fetch all customers with an FCM token
//     const customers = await Feedback.find({ fcmToken: { $exists: true } });

//     if (!customers.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No customers found with valid FCM tokens.",
//       });
//     }

//     // Initialize arrays to track successes and failures
//     const results = {
//       sent: [],
//       failed: [],
//     };

//     // Send notifications to each customer
//     for (const customer of customers) {
//       const { fcmToken, name } = customer;
//       const title = "Visit Us Again!";
//       const body = "Enjoy a 30% discount on your next visit to our restaurant!";
//       const data = {
//         promotionCode: "DISCOUNT30",
//         validTill: "2024-12-31",
//       };

//       try {
//         // Call the sendNotification service
//         const response = await sendNotification(fcmToken, title, body, data);
        
//         // Check if the notification was sent successfully
//         if (response.success) {
//           results.sent.push({ name, fcmToken, response: response.response });
          
//           // Update feedback with notification status
//           await Feedback.updateOne(
//             { fcmToken }, 
//             { $set: { notificationStatus: 'Sent' } }
//           );
//         } else {
//           results.failed.push({ name, fcmToken, error: response.error });
          
//           // Update feedback with notification failure status
//           await Feedback.updateOne(
//             { fcmToken }, 
//             { $set: { notificationStatus: 'Failed' } }
//           );
//         }
//       } catch (error) {
//         // Handle failure for individual notifications
//         results.failed.push({ name, fcmToken, error: error.message });
//         console.error(`Failed to send notification to ${name}:`, error.message);
        
//         // Update feedback with notification failure status
//         await Feedback.updateOne(
//           { fcmToken }, 
//           { $set: { notificationStatus: 'Failed' } }
//         );
//       }
//     }
    
//     // Respond with the results of the notifications
//     res.status(200).json({
//       success: true,
//       message: "Promotional notifications processed.",
//       results,
//     });
//   } catch (error) {
//     // Catch errors from the entire process
//     console.error("Error sending notifications:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send notifications.",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;



    ///// letest changes////




    
// // routes/notificationsRoutes.js
// const express = require("express");
// const router = express.Router();
// const Feedback = require("../models/feedback");
// const { sendNotification } = require("../services/firebase-notification-service");

// router.post("/send-promotion", async (req, res) => {
//   try {
//     const customers = await Feedback.find({ 
//       notificationStatus: { $in: ['Not Sent', 'Failed'] },
//       fcmToken: { $exists: true, $ne: null }
//     });

//     if (!customers.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No pending notifications found.",
//       });
//     }

//     const results = {
//       sent: [],
//       failed: [],
//     };

//     for (const customer of customers) {
//       const { fcmToken, name, _id } = customer;
//       const title = "Special Offer!";
//       const body = `Hello ${name}, enjoy a 30% discount on your next visit!`;
//       const data = {
//         promotionCode: "DISCOUNT30",
//         // validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
//         validTill: new Date(Date.now() + 1 * 60 * 1000).toISOString(),

//       };

//       try {
//         const response = await sendNotification(fcmToken, title, body, data);
//         results.sent.push({ name, fcmToken });
        
//         await Feedback.updateOne(
//           { _id }, 
//           { notificationStatus: 'Sent' }
//         );
//       } catch (error) {
//         results.failed.push({ name, fcmToken, error: error.message });
        
//         await Feedback.updateOne(
//           { _id }, 
//           { notificationStatus: 'Failed' }
//         );
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Promotional notifications processed.",
//       results,
//     });
//   } catch (error) {
//     console.error("Error sending notifications:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send notifications.",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;    ///// runing one//






// // routes/notificationsRoutes.js/////// this also check once//
// const express = require("express");
// const router = express.Router();
// const Feedback = require("../models/feedback");

// router.post("/schedule-promotion", async (req, res) => {
//   try {
//     const { scheduledTime } = req.body;
    
//     if (!scheduledTime) {
//       return res.status(400).json({
//         success: false,
//         message: "Scheduled time is required"
//       });
//     }

//     const scheduledDate = new Date(scheduledTime);
    
//     if (isNaN(scheduledDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid scheduled time format"
//       });
//     }

//     const customers = await Feedback.find({ 
//       notificationStatus: { $in: ['Not Sent', 'Failed'] },
//       fcmToken: { $exists: true, $ne: null }
//     });

//     if (!customers.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No eligible customers found for notifications.",
//       });
//     }

//     const updateResult = await Feedback.updateMany(
//       { 
//         _id: { $in: customers.map(c => c._id) }
//       },
//       { 
//         $set: {
//           notificationStatus: 'Scheduled',
//           scheduledTime: scheduledDate
//         }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Notifications scheduled successfully",
//       scheduledTime: scheduledDate,
//       customersScheduled: updateResult.modifiedCount
//     });
//   } catch (error) {
//     console.error("Error scheduling notifications:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to schedule notifications",
//       error: error.message
//     });
//   }
// });

// router.get("/status", async (req, res) => {
//   try {
//     const stats = await Feedback.aggregate([
//       {
//         $group: {
//           _id: "$notificationStatus",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     res.status(200).json({
//       success: true,
//       stats
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch notification stats",
//       error: error.message
//     });
//   }
// });

// module.exports = router;





// routes/notificationsRoutes.js
const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");

// Add this new route to schedule an immediate notification
router.post("/schedule-immediate", async (req, res) => {
  try {
    const { userId } = req.body; // Optional: to schedule for specific user
    
    // Set scheduled time to 1 minute from now
    const scheduleTime = new Date(Date.now() + 60 * 1000);
    
    let query = { 
      notificationStatus: { $in: ['Not Sent', 'Failed'] },
      fcmToken: { $exists: true, $ne: null }
    };
    
    if (userId) {
      query._id = userId;
    }

    const updateResult = await Feedback.updateMany(
      query,
      { 
        $set: {
          notificationStatus: 'Pending',
          scheduledTime: scheduleTime
        }
      }
    );

    res.status(200).json({
      success: true,
      message: "Notifications scheduled for 1 minute from now",
      scheduledTime: scheduleTime,
      customersScheduled: updateResult.modifiedCount
    });
  } catch (error) {
    console.error("Error scheduling notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule notifications",
      error: error.message
    });
  }
});

// Add a route to check current notification status
router.get("/check-status", async (req, res) => {
  try {
    const notifications = await Feedback.find(
      {},
      'name notificationStatus scheduledTime sentTime fcmToken'
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
      total: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
});

// Add this route to create a test feedback entry
router.post("/create-test", async (req, res) => {
  try {
    const testFeedback = new Feedback({
      submissionId: new mongoose.Types.ObjectId().toString(),
      name: "Test User",
      phoneNumber: "1234567890",
      email: "test@test.com",
      feedback: "Test feedback",
      fcmToken: "your_test_fcm_token", // Replace with a real FCM token
      notificationStatus: 'Not Sent'
    });

    await testFeedback.save();

    res.status(201).json({
      success: true,
      message: "Test feedback created",
      feedback: testFeedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create test feedback",
      error: error.message
    });
  }
});

module.exports = router;