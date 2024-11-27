const MenuItem = require('../models/menuItem');

const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createMenuItem = async (req, res) => {
  const { name, price, description } = req.body;
  const menuItem = new MenuItem({ name, price, description });
  await menuItem.save();
  res.status(201).json(menuItem);
};

const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { name, price, description },
      { new: true }  // Return updated document
    );
    if (!updatedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
