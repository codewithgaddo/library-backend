const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ student: 1, book: 1 }, { unique: true }); // The same student cannot comment on the same book again

module.exports = mongoose.model('Comment', commentSchema);