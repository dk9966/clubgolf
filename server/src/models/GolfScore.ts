import mongoose, { Document, Schema } from "mongoose";

export interface IGolfScore extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  totalScore: number;
  holeScores: number[];
  holesPlayed: number;
  club?: mongoose.Types.ObjectId;
  notes?: string;
}

const golfScoreSchema = new Schema<IGolfScore>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    holeScores: {
      type: [Number],
      required: true,
      validate: {
        validator: function (scores: number[]) {
          return scores.length > 0 && scores.length <= 18;
        },
        message: "Must provide between 1 and 18 hole scores",
      },
    },
    holesPlayed: {
      type: Number,
      required: true,
      min: 1,
      max: 18,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to calculate total score before saving
golfScoreSchema.pre("save", function (next) {
  if (this.holeScores) {
    this.totalScore = this.holeScores.reduce((acc, score) => acc + score, 0);
    this.holesPlayed = this.holeScores.length;
  }
  next();
});

export default mongoose.model<IGolfScore>("GolfScore", golfScoreSchema);
