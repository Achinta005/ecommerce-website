import mongoose, { Schema, models } from "mongoose";

const ProductSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    inventory: { type: Number, required: true },
    images: { type: [String], default: [] },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ProductSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

ProductSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ lastUpdated: new Date() });
  next();
});

const Product = models.Product || mongoose.model("Product", ProductSchema);

export default Product;
