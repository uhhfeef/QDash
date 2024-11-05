require("dotenv").config();
const express = require("express");
const path = require("path");
const OpenAI = require("openai");
const sqlite3 = require("sqlite3").verbose();
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Existing Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // Check if user exists in database
        db.get(
          "SELECT * FROM users WHERE google_id = ?",
          [profile.id],
          async (err, user) => {
            if (err) {
              return done(err);
            }

            if (!user) {
              // Create new user if doesn't exist
              const newUser = {
                google_id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                created_at: new Date(),
              };

              db.run(
                "INSERT INTO users (google_id, email, name, created_at) VALUES (?, ?, ?, ?)",
                [
                  newUser.google_id,
                  newUser.email,
                  newUser.name,
                  newUser.created_at,
                ],
                function (err) {
                  if (err) {
                    return done(err);
                  }
                  newUser.id = this.lastID;
                  return done(null, newUser);
                }
              );
            } else {
              return done(null, user);
            }
          }
        );
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser((id, done) => {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
    done(err, user);
  });
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

// Middleware
app.use(express.json());
app.use("/data", express.static("data"));

// Database connection
const db = new sqlite3.Database("data/dashboard.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");

    // Create users table if it doesn't exist
    db.run(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_id TEXT UNIQUE,
        email TEXT,
        name TEXT,
        created_at DATETIME
      )
    `,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err);
        } else {
          console.log("Users table ready");
        }
      }
    );
  }
});

// Auth Routes
app.get("/login", (req, res) => {
  // If already authenticated, redirect to home
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Update the Google callback route to redirect to root
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/", // This will now go to the authenticated homepage
  })
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

// // Protected Routes
// Make root route protected
app.get(
  "/",
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
    } else {
      next();
    }
  },
  (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
);

// Move static middleware AFTER the routes
app.use(
  express.static("public", {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// OpenAI API endpoint
app.post("/api/chat", isAuthenticated, async (req, res) => {
  try {
    const { messages, tools, tool_choice } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
      tool_choice: tool_choice,
    });

    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

app.post("/api/query", isAuthenticated, (req, res) => {
  const { query } = req.body;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
