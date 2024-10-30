let tableSchema = '';
let tools = [];
let chatMessages = [];

// Initialize table schema when the page loads
async function initializeTableSchema() {
    try {
        tableSchema = await getTableSchema();
        // console.log(tableSchema);
        initializeTools(); // initialize tools only if schema is loaded
    } catch (error) {
        console.error('Error loading table schema:', error);
        tableSchema = 'Error loading schema';
    }
}

function initializeTools() {
    tools = [
        {
            "type": "function",
            "function": {
                "name": "execute_sql_query",
                "description": "Execute a SQL query on the database based on user request. The data will be used to create charts. You must always output 2 values, x and y. Schema is: " + tableSchema,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The SQL query to execute"
                        }
                    },
                    "required": ["query"]
                }
            }
        }
    ];
    
    // for (const tool of tools) {
    //     console.log(tool);
    // }
}

export function addMessageToChat(content, role) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export async function handleChatSubmit() {
    console.log('handleChatSubmit called');
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();
    
    if (!userMessage) return;
    
    addMessageToChat(userMessage, 'user');
    
    // Format the chat history into a readable string
    const formattedHistory = chatMessages.map(msg => 
        `${msg.role}: ${msg.content}`
    ).join('\n');
    
    let messages = [
        {"role": "system", "content": "You are a helpful assistant. Use the available tools to assist the user. Make sure to provide explanations for your actions. Keep it concise and to the point. NEVER EVER INSERT OR DELETE FROMT THE TABLE"},
        {"role": "user", "content": userMessage + " Context - Previous messages:\n" + formattedHistory}
    ];
    console.log(messages);

    chatInput.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                tools: tools
            })
        });

        const data = await response.json();
        const message = data.choices[0].message;
        messages.push(message);
        chatMessages.push(message); // add to chat history  
        console.log(chatMessages);

        if (message.content) {
            addMessageToChat(message.content, 'assistant');
        }
        
        if (message.tool_calls) {
            const functionCall = message.tool_calls[0];
            const args = JSON.parse(functionCall.function.arguments);
            
            switch (functionCall.function.name) {
                case 'createLineChart':
                    createLineChart(args.x, args.y);
                    addMessageToChat(`Creating line chart with provided data.`, 'assistant');
                    break;
                case 'execute_sql_query':
                    const queryResult = await executeSqlQuery(args.query);
                    if (queryResult && queryResult.length > 0) {
                        // Extract x and y values from query result
                        const x = queryResult.map(row => Object.values(row)[0]); // First column
                        console.log(x);
                        const y = queryResult.map(row => Object.values(row)[1]); // Second column
                        console.log(y);
                        createLineChart(x, y);
                    }
                    addMessageToChat(`Executing SQL query: ${args.query}`, 'assistant');
                    break;
            }
        }
        console.log('message:', message);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('Sorry, there was an error processing your request.', 'assistant');
    }
} 
// Move event listeners inside a DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // Initialize schema
    initializeTableSchema();
    
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('chat-input');
    
    if (sendButton) {
        sendButton.addEventListener('click', () => handleChatSubmit());
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleChatSubmit();
            }
        });
    }
});

