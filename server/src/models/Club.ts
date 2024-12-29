import mongoose, { Document, Schema } from "mongoose";

export interface IClub extends Document {
  name: string;
  manager: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  description?: string;
}

const clubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClub>("Club", clubSchema);
