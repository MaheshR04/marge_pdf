import mongoose from "mongoose";

const recentFileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    data: {
      type: Buffer,
      required: true
    }
  },
  { timestamps: true }
);

const RecentFile = mongoose.model("RecentFile", recentFileSchema);

export default RecentFile;
