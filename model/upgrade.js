const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const upgradeSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    required: true
  },
  poolId: {
    type: Number,
    required: true
  },
  checked: {
    type: Number,
    default: 0
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

upgradeSchema.index(
  { user: 1, referrer: 1, poolId: 1, txHash: 1 },
  { unique: true }
);

const upgrade = mongoose.model('upgrade', upgradeSchema);

module.exports = upgrade;
