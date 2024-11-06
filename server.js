require("dotenv").config();
const express = require("express");
const path = require("path");
const OpenAI = require("openai");
const sqlite3 = require("sqlite3").verbose();
const passport = require("./auth"); //for auth
const session = require("express-session"); //for auth

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(
  express.static("public", {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);
app.use(express.json());
app.use("/data", express.static("data"));

// Database connection
const db = new sqlite3.Database("data/dashboard.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

/* start of auth*/
/* Taher will take care */
// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Authentication routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] }),
  (req, res) => {
    console.log("Redirecting to Google authentication...");
  }
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("Google authentication callback received.");
    // Redirect to the frontend server (http://localhost:3000)
    res.redirect("http://localhost:3000/?authSuccess=true");
  },
  (err) => {
    console.error("Error during Google authentication:", err);
    res.status(500).json({ error: "An error occurred during authentication." });
  }
);

/*end of auth*/

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// OpenAI API endpoint
app.post("/api/chat", async (req, res) => {
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

app.post("/api/query", (req, res) => {
  console.log("Query received:", req.body.query);

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
