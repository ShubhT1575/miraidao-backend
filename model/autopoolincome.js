const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const autopoolincomeSchema = new Schema({
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

autopoolincomeSchema.index(
  { sender: 1, receiver: 1, amount: 1, poolId: 1, txHash: 1 },
  { unique: true }
);


const autopoolincome = mongoose.model('autopoolincome', autopoolincomeSchema);

module.exports = autopoolincome;
