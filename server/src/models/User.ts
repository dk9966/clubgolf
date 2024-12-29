import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  facebookId?: string;
  clubs?: Schema.Types.ObjectId[];
  managedClubs?: Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      required: false,
    },
    facebookId: {
      type: String,
      required: false,
    },
    clubs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Club",
        required: false,
      },
    ],
    managedClubs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Club",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("User", userSchema);
