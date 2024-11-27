const express = require('express');
const router = express.Router();
const menuItemsController = require('../controllers/menuItemsController');  // Correct path

// Route to get all menu items
router.get('/menuitems', menuItemsController.getMenuItems);

// Route to add a new menu item
router.post('/menuitems', menuItemsController.createMenuItem);  // Use createMenuItem here

// Route to update a menu item
router.put('/menuitems/:id', menuItemsController.updateMenuItem);  // Add update route

// Route to delete a menu item
router.delete('/menuitems/:id', menuItemsController.deleteMenuItem);  // Add delete route

module.exports = router;
