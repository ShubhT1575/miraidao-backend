const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newuserplaceSchema = new Schema({
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
  packageId: {
    type: Number,
    default: 0
  },
  place: {
    type: Number,
    default: 0
  },
  cycle: {
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

newuserplaceSchema.index(
  { user: 1, referrer: 1,poolId:1,packageId: 1,place:1,cycle:1, txHash: 1 },
  { unique: true }
);


const newuserplace = mongoose.model('newuserplace', newuserplaceSchema);

module.exports = newuserplace;
