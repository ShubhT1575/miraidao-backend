const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dividentincomeSchema = new Schema({
  user: {
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

dividentincomeSchema.index(
  { user: 1, amount: 1, txHash: 1 },
  { unique: true }
);

const dividentincome = mongoose.model('dividentincome', dividentincomeSchema);

module.exports = dividentincome;
