const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const News = new Schema({
  title: { type: String, required: true },
  blocks: [
    {
      type: {
        type: String, 
        required: true,
        enum: ["text", "image", "quote", "video"]
      },
      mediaRef: { type: Schema.Types.ObjectId, ref: 'DocumentUpload' },
      content: { type: Schema.Types.Mixed, required: true }, 
      order: { type: Number, default: 0 }
    }
  ],
  tags: [String], 
  category: { type: String }, 
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("News", News);
 