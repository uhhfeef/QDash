require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const { observeOpenAI } = require('langfuse');
const { randomUUID } = require('crypto');

const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const langfuseOpenAI = observeOpenAI(openai); // Wrap the OpenAI client with Langfuse


// Middleware
app.use(express.static('public'));
app.use(express.json());

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
