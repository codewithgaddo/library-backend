const Category = require("../models/Category");

// Add Category
const addCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json({ message: "Category created", category: newCategory });
  } catch (err) {
    res.status(500).json({ message: "Category could not be added", error: err.message });
  }
};

// Get All Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Categories could not be loaded", error: err.message });
  }
};

// Update Categories by Id
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updated = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category" });
  }
};

// Update Categories by Id
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
};


module.exports = {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
};
