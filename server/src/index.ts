import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";

// Import routes
import authRoutes from "./routes/auth";
import clubRoutes from "./routes/clubs";
import scoreRoutes from "./routes/scores";

// Import passport config
import "./config/passport";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/clubs", clubRoutes);
app.use("/scores", scoreRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
