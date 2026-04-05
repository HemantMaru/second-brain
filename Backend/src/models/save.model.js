import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema({
  text: String,
  color: { type: String, default: "yellow" },
  note: String, // Highlight ke saath choti tippani
  pageNumber: Number, // Sirf PDF ke liye
  createdAt: { type: Date, default: Date.now },
});
const itemSchema = new mongoose.Schema(
  {
    embedding: {
      type: [Number], // Numbers ka array jisme AI data hoga
      default: [],
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    collection: {
      type: String,
      default: "General",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: "",
    },
    lastOpened: {
      type: Date,
      default: null,
    },
    shareId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    highlights: [highlightSchema],
  },
  { suppressReservedKeysWarning: true },
);

const saveModel = mongoose.model("Item", itemSchema);
export default saveModel;
