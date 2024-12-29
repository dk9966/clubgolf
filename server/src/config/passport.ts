import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import User, { IUser } from "../models/User";

passport.serializeUser((user: IUser, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, undefined);
  }
});

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }
        if (!user.password) {
          return done(null, false, {
            message: "Account exists with social login.",
          });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Google Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ googleId: profile.id });
          if (existingUser) {
            return done(null, existingUser);
          }
          const user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
          });
          return done(null, user);
        } catch (err) {
          return done(err, undefined);
        }
      }
    )
  );
}

// Facebook Strategy (only if credentials are provided)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "emails", "name"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ facebookId: profile.id });
          if (existingUser) {
            return done(null, existingUser);
          }
          const user = await User.create({
            facebookId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
          });
          return done(null, user);
        } catch (err) {
          return done(err, undefined);
        }
      }
    )
  );
}

export default passport;
