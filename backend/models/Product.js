const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: "General", trim: true },
  brand: { type: String, default: "Luwia", trim: true },
  rating: { type: Number, default: 4, min: 0, max: 5 },
  soldCount: { type: Number, default: 0, min: 0 },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  seoTitle: { type: String, default: "" },
  seoDescription: { type: String, default: "" },
  keywords: { type: [String], default: [] },
  seoSlug: { type: String, default: "", trim: true },
  metaRobots: { type: String, default: "index,follow" },
  canonicalUrl: { type: String, default: "" }
});

module.exports = mongoose.model("Product", productSchema);