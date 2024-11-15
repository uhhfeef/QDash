require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const OpenAI = require('openai');
const { observeOpenAI } = require('langfuse');
const { randomUUID } = require('crypto');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Initialize session store
const sessionStore = new SQLiteStore({
    dir: './db',
    db: 'sessions.db'
});

const app = express();
const port = process.env.PORT || 3001;

// Middleware order is important
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Session middleware
app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    }
}));

// Initialize SQLite database
let db;
(async () => {
    db = await open({
        filename: 'users.db',
        driver: sqlite3.Database
    });

    // Create users table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insert demo user if it doesn't exist
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);
    try {
        await db.run(
            'INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)',
            ['demo', 'demo@example.com', hashedPassword]
        );
    } catch (err) {
        console.error('Error creating demo user:', err);
    }
})();

// Authentication middleware
const requireAuth = (req, res, next) => {
    try {
        // Allow CORS preflight requests
        if (req.method === 'OPTIONS') {
            return next();
        }
        
        // For API requests, return 401 instead of redirecting
        if (req.path.startsWith('/api/')) {
            if (req.path === '/api/login' || req.path === '/api/register' || 
                req.path === '/api/auth-status' || req.path === '/api/logout') {
                return next();
            }
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // For non-API requests, check session
        if (!req.session || !req.session.userId) {
            return res.redirect('/login');
        }
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware
app.use(requireAuth); 
app.use(express.static('public')); 

// Registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if username or email already exists
        const existingUser = await db.get(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(400).json({
                error: 'Username or email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        await db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Find user by username
        const user = await db.get(
            'SELECT * FROM users WHERE username = ?',
            [userId]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user.username;
        res.json({ message: 'Logged in successfully' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Serve the login page
app.get('/login', (req, res) => {
    if (req.session && req.session.userId) {
        res.redirect('/');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Check auth status
app.get('/api/auth-status', (req, res) => {
    try {
        const isAuthenticated = !!(req.session && req.session.userId);
        console.log('Auth status check:', {
            isAuthenticated,
            session: req.session,
            userId: req.session?.userId
        });
        res.json({ 
            isAuthenticated,
            userId: req.session?.userId 
        });
    } catch (error) {
        console.error('Auth status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const langfuseOpenAI = observeOpenAI(openai); // Wrap the OpenAI client with Langfuse

const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// OpenAI API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        // Example request body:
        // messages: [{role: "user", content: "Hello, how are you?"}, {role: "assistant", content: "I'm doing great, thank you!"}]
        // tools: [{type: "function", function: {name: "get_current_time", description: "Get the current time", parameters: {type: "object", properties: {time: {type: "string", description: "The current time"}}}}]
        // tool_choice: "auto"
        const { messages, tools, tool_choice } = req.body;
        // console.log('Messages being sent to LLM:', JSON.stringify(req.body, null, 4));

        const response = await langfuseOpenAI.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            tools: tools,
            tool_choice: tool_choice,
        });

        // console.log('Response from LLM:', JSON.stringify(response, null, 4));
        res.json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
