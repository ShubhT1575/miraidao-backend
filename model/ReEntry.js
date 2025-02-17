const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReEntrySchema = new Schema({
  user: {
    type: String,
    required: true
  },
  packageId: {
    type: Number,
    required: true
  },
  reinvest: {
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

ReEntrySchema.index(
  { user: 1, packageId: 1, txHash: 1 },
  { unique: true }
);

const ReEntry = mongoose.model('ReEntry', ReEntrySchema);

module.exports = ReEntry;
