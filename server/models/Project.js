const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true,
    default: "New Site Project"
  },
  location: {
    type: String,
    enum: ["Island — Lekki / VI / Ikoyi", "Mainland — Ikeja / Surulere", "Outskirts — Ajah / Ikorodu"],
    default: "Island — Lekki / VI / Ikoyi"
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      name: String,
      price: Number,
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      image: String,
      brand: String
    }
  ],
  status: {
    type: String,
    enum: ["Draft", "Quote Requested", "Ordered", "Archived"],
    default: "Draft"
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Project", projectSchema);
