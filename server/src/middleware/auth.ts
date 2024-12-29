import { NextFunction, Response } from "express";
import { Request as ExpressRequest } from "express-serve-static-core";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthRequest extends ExpressRequest {
  user?: any;
  token?: string;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // First check if user is authenticated via session
    if (req.isAuthenticated()) {
      return next();
    }

    // If not, check for JWT token
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "No auth token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authenticated" });
  }
};
