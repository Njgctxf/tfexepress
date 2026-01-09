import mongoose from "mongoose";

const featuredCategorySchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "FeaturedCategory",
  featuredCategorySchema
);
