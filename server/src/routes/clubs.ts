import express, { NextFunction, Response } from "express";
import { Types } from "mongoose";
import { AuthRequest, auth } from "../middleware/auth";
import Club from "../models/Club";
import GolfScore from "../models/GolfScore";
import User from "../models/User";

const router = express.Router();

// Middleware to check if user is club manager
const isClubManager = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    if (club.manager.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized as club manager" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: "Error checking manager status" });
  }
};

// Create a new club
router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const user = req.user;

    const club = await Club.create({
      name,
      description,
      manager: user.id,
      members: [user.id],
    });

    // Update user's clubs and managedClubs
    await User.findByIdAndUpdate(user.id, {
      $push: { clubs: club.id, managedClubs: club.id },
    });

    return res.status(201).json(club);
  } catch (err) {
    return res.status(500).json({ message: "Error creating club" });
  }
});

// Get all clubs for a user
router.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const clubs = await Club.find({ members: user.id })
      .populate("manager", "name email")
      .populate("members", "name email");
    return res.json(clubs);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching clubs" });
  }
});

// Get club details
router.get("/:clubId", auth, async (req: AuthRequest, res: Response) => {
  try {
    const club = await Club.findById(req.params.clubId)
      .populate("manager", "name email")
      .populate("members", "name email");

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    return res.json(club);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching club details" });
  }
});

// Update club details (manager only)
router.put(
  "/:clubId",
  auth,
  isClubManager,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description } = req.body;
      const updatedClub = await Club.findByIdAndUpdate(
        req.params.clubId,
        { name, description },
        { new: true }
      )
        .populate("manager", "name email")
        .populate("members", "name email");

      return res.json(updatedClub);
    } catch (err) {
      return res.status(500).json({ message: "Error updating club" });
    }
  }
);

// Join a club
router.post("/:clubId/join", auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (club.members.includes(user.id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    await Club.findByIdAndUpdate(club.id, {
      $push: { members: user.id },
    });

    await User.findByIdAndUpdate(user.id, {
      $push: { clubs: club.id },
    });

    return res.json({ message: "Joined club successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error joining club" });
  }
});

// Leave a club
router.post("/:clubId/leave", auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (club.manager.toString() === user.id) {
      return res.status(400).json({
        message: "Club manager cannot leave. Transfer management first.",
      });
    }

    if (!club.members.includes(user.id)) {
      return res.status(400).json({ message: "Not a member of this club" });
    }

    await Club.findByIdAndUpdate(club.id, {
      $pull: { members: user.id },
    });

    await User.findByIdAndUpdate(user.id, {
      $pull: { clubs: club.id },
    });

    return res.json({ message: "Left club successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error leaving club" });
  }
});

// Remove member (manager only)
router.post(
  "/:clubId/remove/:memberId",
  auth,
  isClubManager,
  async (req: AuthRequest, res: Response) => {
    try {
      const club = await Club.findById(req.params.clubId);
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }

      const memberId = new Types.ObjectId(req.params.memberId);

      if (club.manager.equals(memberId)) {
        return res.status(400).json({ message: "Cannot remove club manager" });
      }

      if (!club.members.some((id) => id.equals(memberId))) {
        return res
          .status(400)
          .json({ message: "User is not a member of this club" });
      }

      await Club.findByIdAndUpdate(club.id, {
        $pull: { members: memberId },
      });

      await User.findByIdAndUpdate(memberId, {
        $pull: { clubs: club.id },
      });

      return res.json({ message: "Member removed successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Error removing member" });
    }
  }
);

// Transfer club management (manager only)
router.post(
  "/:clubId/transfer/:newManagerId",
  auth,
  isClubManager,
  async (req: AuthRequest, res: Response) => {
    try {
      const club = await Club.findById(req.params.clubId);
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }

      const newManagerId = new Types.ObjectId(req.params.newManagerId);
      const currentManager = req.user;

      if (!club.members.some((id) => id.equals(newManagerId))) {
        return res
          .status(400)
          .json({ message: "New manager must be a club member" });
      }

      // Update club
      await Club.findByIdAndUpdate(club.id, {
        manager: newManagerId,
      });

      // Update old manager's managedClubs
      await User.findByIdAndUpdate(currentManager.id, {
        $pull: { managedClubs: club.id },
      });

      // Update new manager's managedClubs
      await User.findByIdAndUpdate(newManagerId, {
        $push: { managedClubs: club.id },
      });

      return res.json({ message: "Club management transferred successfully" });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error transferring club management" });
    }
  }
);

// Get club statistics
router.get("/:clubId/stats", auth, async (req: AuthRequest, res: Response) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const { date } = req.query;
    let dateFilter = {};

    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      dateFilter = {
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    const scores = await GolfScore.find({
      club: club.id,
      ...dateFilter,
    }).populate("user", "name");

    const stats = {
      averageScore: 0,
      lowestScore: 0,
      highestScore: 0,
      totalRounds: scores.length,
    };

    if (scores.length > 0) {
      stats.averageScore =
        scores.reduce((acc, score) => acc + score.totalScore, 0) /
        scores.length;
      stats.lowestScore = Math.min(...scores.map((score) => score.totalScore));
      stats.highestScore = Math.max(...scores.map((score) => score.totalScore));
    }

    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching club statistics" });
  }
});

export default router;
