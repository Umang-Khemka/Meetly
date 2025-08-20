import mongoose, { Schema } from "mongoose";
import { type } from "node:os";

const meetingSchema = new Schema(
  {
    user_id: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
     },
    meetingCode: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true }
  }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };
