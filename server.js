require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use('/data', express.static('data'));

// Database connection
const db = new sqlite3.Database('data/orders.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// OpenAI API endpoint
app.post('/api/chat', async (req, res) => {
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
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.post('/api/query', (req, res) => {
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
