const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recentSchema = new Schema({
  sender: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  income: {
    type: Number,
    required: true
  },
  income_type: {
    type: String
  },
  txHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const recentincome = mongoose.model('recentincome', recentSchema);

module.exports = recentincome;
