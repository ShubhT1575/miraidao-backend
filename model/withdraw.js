const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawalSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  withdrawAmount: {
    type: Number,
    required: true
  },
  withdrawToken: {
    type: Number,
    required: true
  },
  sendToken: {
    type: Number,
    default: 0
  },
  rate: {
    type: Number,
    required: true
  },
  pay_rate: {
    type: Number,
    default : 0
  },
  wallet_type: {
    type: String,
    required: true
  },
  isapprove : {
    type: Boolean,
    default : false
  },
  isreject : {
    type: Boolean,
    default : false
  },
  trxnHash : {
    type: String,
    default : null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  timestamp:{
    type: Date,
    default: Date.now
  }
});

const WithdrawalModel = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = WithdrawalModel;