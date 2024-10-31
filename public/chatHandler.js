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
            type: "function",
            function: {
                name: "executeSqlQuery",
                strict: true,
                description: "Execute a SQL query on the database based on user request. The data will be used to create charts. You must always output 2 values, x and y. Schema is: " + tableSchema,
                parameters: {
                    type: "object",
                    properties: {
                        "query": {
                            type: "string",
                            description: "The SQL query to execute"
                        }
                    },
                    required: ["query"],
                    additionalProperties: false
                }
            },
        },
        {
            type: "function",
            function: {
                name: "createLineChart",
                description: "Create a line chart with the provided x and y values",
                parameters: {
                    type: "object",
                    properties: {
                        x: { 
                            type: "array", 
                            description: "The fetched database x values for the line chart", 
                            items: { type: "number" } 
                        },
                        y: { 
                            type: "array", 
                            description: "The fetched database y values for the line chart", 
                            items: { type: "number" } 
                        }
                    },
                    required: ["x", "y"],
                    additionalProperties: false
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
        {"role": "system", "content": "You are a helpful assistant. Let's think step by step. You have access to a database and 2 tools. an sql tool and a chart tool. You must use the sql tool to get the data from the database. and the chart tool to create charts. Your top priority is to get the data from the database and then create a chart by calling the chart tool. use multiple tools if needed. You will NEVER GENERATE RANDOM X AND Y VALUES for the chart tool. You will always double check and think step by step before you call the chart tool. If you need to perform multiple steps, explicitly state 'CONTINUE' at the end of your message. If you're done with all steps, explicitly state 'DONE' at the end of your message. NEVER EVER INSERT OR DELETE FROM THE TABLE"},
        {"role": "user", "content": userMessage + " Context - Previous messages:\n" + formattedHistory}
    ];
    // console.log(messages);

    chatInput.value = '';
    let iterationCount = 0;
    const MAX_ITERATIONS = 5;

    try {
        while (iterationCount < MAX_ITERATIONS) {
            console.log('Messages', messages);
            iterationCount++;
            console.log(`Iteration ${iterationCount} of ${MAX_ITERATIONS}`);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    tools: tools,
                    tool_choice: "auto"
                })
            });

            const data = await response.json();
            console.log('data', data);
            const message = data.choices[0].message;
            messages.push(message);
            chatMessages.push(message);

            if (message.content) {
                addMessageToChat(message.content, 'assistant');
                if (message.content.includes('DONE')) {
                    break;
                }   
            }
            
            if (message.tool_calls) {
                for (const toolCall of message.tool_calls) {
                    const args = JSON.parse(toolCall.function.arguments);
                    let toolResult;
                    
                    switch (toolCall.function.name) {
                        case 'createLineChart':
                            createLineChart(args.x, args.y);
                            toolResult = { success: true, message: 'Chart created successfully' };
                            addMessageToChat(`Creating line chart with provided data.`, 'assistant');
                            break;
                            
                        case 'executeSqlQuery':
                            const queryResult = await executeSqlQuery(args.query);
                            toolResult = queryResult;
                            if (queryResult && queryResult.length > 0) {
                                const x = queryResult.map(row => Object.values(row)[0]);
                                const y = queryResult.map(row => Object.values(row)[1]);
                                console.log('Query results - x:', x, 'y:', y);
                                toolResult = { x, y, queryResult };
                            }
                            addMessageToChat(`Executing SQL query: ${args.query}`, 'assistant');
                            break;
                    }

                    // Add tool response message
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });
                }
            }
        }

        if (iterationCount >= MAX_ITERATIONS) {
            addMessageToChat("Reached maximum number of iterations. Stopping here.", 'assistant');
        }

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

