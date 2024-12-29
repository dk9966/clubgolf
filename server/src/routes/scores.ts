import express, { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Club from "../models/Club";
import GolfScore from "../models/GolfScore";

const router = express.Router();

// Helper function to check if user is a manager of the club
const isClubManager = async (
  userId: string,
  clubId: string
): Promise<boolean> => {
  try {
    const club = await Club.findById(clubId);
    return club?.manager.toString() === userId;
  } catch (err) {
    return false;
  }
};

// Middleware to check if user is authenticated
const isAuthenticated = (req: AuthRequest, res: Response, next: Function) => {
  console.log("Authentication check:", {
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    session: req.session,
  });

  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
};

// Add a new golf score
router.post("/", isAuthenticated, async (req: AuthRequest, res: Response) => {
  try {
    const { holeScores, club, notes } = req.body;
    const user = req.user;

    if (
      !Array.isArray(holeScores) ||
      holeScores.length === 0 ||
      holeScores.length > 18
    ) {
      return res
        .status(400)
        .json({ message: "Must provide between 1 and 18 hole scores" });
    }

    const totalScore = holeScores.reduce(
      (acc: number, score: number) => acc + score,
      0
    );

    const golfScore = await GolfScore.create({
      user: user.id,
      holeScores,
      totalScore,
      holesPlayed: holeScores.length,
      club,
      notes,
    });

    return res.status(201).json(golfScore);
  } catch (err) {
    return res.status(500).json({ message: "Error creating golf score" });
  }
});

// Get all scores for a user
router.get("/", isAuthenticated, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const scores = await GolfScore.find({ user: user.id })
      .populate("club", "name")
      .sort({ date: -1 });
    return res.json(scores);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching golf scores" });
  }
});

// Get a specific score
router.get(
  "/:scoreId",
  isAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      console.log("User attempting to fetch score:", req.user);
      const score = await GolfScore.findById(req.params.scoreId)
        .populate("club", "name")
        .populate("user", "name");

      if (!score) {
        return res.status(404).json({ message: "Score not found" });
      }

      const user = req.user;
      // Check if user is either the score owner or a manager of the club
      const isOwner = score.user._id.toString() === user.id;
      const isManager = score.club
        ? await isClubManager(user.id, score.club._id.toString())
        : false;

      console.log("Authorization check:", {
        scoreUserId: score.user._id,
        requestUserId: user.id,
        isOwner,
        isManager,
        scoreClub: score.club,
      });

      if (!isOwner && !isManager) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this score" });
      }

      return res.json(score);
    } catch (err) {
      console.error("Error fetching score:", err);
      return res.status(500).json({ message: "Error fetching golf score" });
    }
  }
);

// Update a score
router.put(
  "/:scoreId",
  isAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      const { holeScores, notes } = req.body;
      const user = req.user;

      const score = await GolfScore.findById(req.params.scoreId);
      if (!score) {
        return res.status(404).json({ message: "Score not found" });
      }

      // Check if user is either the score owner or a manager of the club
      const isOwner = score.user.toString() === user.id;
      const isManager = score.club
        ? await isClubManager(user.id, score.club.toString())
        : false;

      if (!isOwner && !isManager) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this score" });
      }

      if (
        holeScores &&
        (!Array.isArray(holeScores) ||
          holeScores.length === 0 ||
          holeScores.length > 18)
      ) {
        return res
          .status(400)
          .json({ message: "Must provide between 1 and 18 hole scores" });
      }

      const totalScore = holeScores
        ? holeScores.reduce((acc: number, score: number) => acc + score, 0)
        : score.totalScore;

      const holesPlayed = holeScores ? holeScores.length : score.holesPlayed;

      const updatedScore = await GolfScore.findByIdAndUpdate(
        req.params.scoreId,
        {
          holeScores: holeScores || score.holeScores,
          totalScore,
          holesPlayed,
          notes: notes || score.notes,
        },
        { new: true }
      ).populate("club", "name");

      return res.json(updatedScore);
    } catch (err) {
      return res.status(500).json({ message: "Error updating golf score" });
    }
  }
);

// Delete a score
router.delete(
  "/:scoreId",
  isAuthenticated,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;
      const score = await GolfScore.findById(req.params.scoreId);

      if (!score) {
        return res.status(404).json({ message: "Score not found" });
      }

      if (score.user.toString() !== user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this score" });
      }

      await GolfScore.findByIdAndDelete(req.params.scoreId);
      return res.json({ message: "Score deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Error deleting golf score" });
    }
  }
);

export default router;
