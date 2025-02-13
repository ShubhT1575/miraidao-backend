const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recurrincomeSchema = new Schema({
  sender: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  poolId: {
    type: Number,
    required: true
  },
  level: {
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

recurrincomeSchema.index(
  { sender: 1, receiver: 1, amount: 1, poolId: 1, level :1, txHash: 1 },
  { unique: true }
);

const recurrlevelincome = mongoose.model('recurrlevelincome', recurrincomeSchema);

module.exports = recurrlevelincome;
