const Category = require("../models/Category");

// Add Category
const addCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json({ message: "Kategori oluşturuldu", category: newCategory });
  } catch (err) {
    res.status(500).json({ message: "Kategori eklenemedi", error: err.message });
  }
};

// Get All Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Kategoriler yüklenemedi", error: err.message });
  }
};

module.exports = {
  addCategory,
  getCategories
};
