const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const directincomeSchema = new Schema({
  sender: {
    type: String,
    required: true
  },
  reciever: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  txHash: { type: String, required: true },
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

directincomeSchema.index(
  { sender: 1, reciever: 1, amount: 1, txHash: 1 },
  { unique: true }
);

const directincome = mongoose.model('directincome', directincomeSchema);

module.exports = directincome;
