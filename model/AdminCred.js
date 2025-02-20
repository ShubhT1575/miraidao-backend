const mongoose = require("mongoose");

const AdminCredSchema = new mongoose.Schema(
  {
    email: { type: String, default: 'admin@miraidao.com',},
    password: { type: String, default: 'admin@1987',},
  },
 
  { timestamps: true, collection: "AdminCred" }
);

module.exports = mongoose.model("AdminCredSchema", AdminCredSchema);