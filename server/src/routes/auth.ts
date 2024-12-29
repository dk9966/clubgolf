import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { AuthRequest, auth } from "../middleware/auth";
import User, { IUser } from "../models/User";

const router = express.Router();

// Register with email/password
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.status(201).json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: "Error creating user" });
  }
});

// Login with email/password
router.post(
  "/login",
  passport.authenticate("local"),
  (req: Request, res: Response) => {
    const user = req.user as IUser;
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );
    return res.json({ token, user });
  }
);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );
      return res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
    }
  );
}

// Facebook OAuth routes (only if configured)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get(
    "/facebook",
    passport.authenticate("facebook", { scope: ["email"] })
  );

  router.get(
    "/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );
      return res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
    }
  );
}

// Logout
router.post("/logout", (req: Request, res: Response) => {
  req.logout(() => {
    return res.json({ message: "Logged out successfully" });
  });
});

// Get current user
router.get("/me", auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("clubs", "name")
      .populate("managedClubs", "name");
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching user data" });
  }
});

export default router;
