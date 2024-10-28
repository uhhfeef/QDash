const OPENAI_API_KEY = ;

// Sample data
const rawData = [65, 59, 80, 81, 56, 55, 72, 68, 75, 63, 58, 78, 82, 60, 71];

// Function to create different types of traces based on chart type
function createTrace(type) {
    const baseTrace = {
        x: rawData,
        marker: {
            color: 'rgba(54, 162, 235, 0.5)',
            line: {
                color: 'rgba(54, 162, 235, 1)',
                width: 1
            }
        }
    };

    switch (type) {
        case 'histogram':
            return {
                ...baseTrace,
                type: 'histogram',
                nbinsx: 7
            };
        case 'bar':
            return {
                ...baseTrace,
                type: 'bar',
                y: rawData,
                x: Array.from({length: rawData.length}, (_, i) => `Data ${i+1}`),
            };
        case 'line':
            return {
                ...baseTrace,
                type: 'scatter',
                y: rawData,
                x: Array.from({length: rawData.length}, (_, i) => `Data ${i+1}`),
                mode: 'lines+markers'
            };
        case 'pie':
            return {
                values: rawData,
                labels: Array.from({length: rawData.length}, (_, i) => `Data ${i+1}`),
                type: 'pie'
            };
        default:
            return baseTrace;
    }
}

// Function to create layout based on chart type
function createLayout(type) {
    const baseLayout = {
        title: 'Data Distribution',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 50, r: 20, b: 50, l: 50 }
    };

    if (type === 'pie') {
        return {
            ...baseLayout,
            height: 500 // Adds a height to the pie chart   
        };
    }

    return {
        ...baseLayout,
        xaxis: {
            title: type === 'histogram' ? 'Values' : 'Data Points', // chooses values if histogram, otherwise data points   
            tickfont: { size: 12 }
        },
        yaxis: {
            title: type === 'histogram' ? 'Frequency' : 'Values', // chooses frequency if histogram, otherwise values   
            tickfont: { size: 12 }
        },
        bargap: 0.05
    };
}

// Function to update the chart
function updateChart(type) {
    const trace = createTrace(type);
    const layout = createLayout(type);
    Plotly.newPlot('myChart', [trace], layout, {responsive: true});
}

// Event listener for dropdown changes
document.getElementById('chartType').addEventListener('change', (e) => {
    updateChart(e.target.value);
});

// Initial chart creation
updateChart('histogram');

const tools = [
    {
        "type": "function",
        "function": {
            "name": "updateChart",
            "description": "Updates the chart with the selected type",
            "parameters": {
                "type": "object",
                "properties": {
                    "chartType": {
                        "type": "string",
                        "enum": ["histogram", "bar", "line", "pie"],
                        "description": "The type of chart to display"
                    }
                },
                "required": ["chartType"]
            }
        }
    }
];

// Remove the hardcoded messages array and add this:
let messages = [
    {"role": "system", "content": "You are a helpful customer support assistant. Use the supplied tools to assist the user."}
];

// Remove the immediate handleUserRequest() call and console.log(response)

// Add these functions for chat handling
function addMessageToChat(content, role) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleChatSubmit() {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();
    
    if (!userMessage) return;
    
    // Add user message to chat
    addMessageToChat(userMessage, 'user');
    
    // Add user message to messages array
    messages.push({"role": "user", "content": userMessage});
    
    // Clear input
    chatInput.value = '';
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",  
                messages: messages,
                tools: tools,
                tool_choice: "auto"
            })
        });

        const data = await response.json();
        
        // Handle the response
        const message = data.choices[0].message;
        
        // Add assistant's response to messages array
        messages.push(message);
        
        // Add assistant's response to chat
        if (message.content) {
            addMessageToChat(message.content, 'assistant');
        }
        
        if (message.tool_calls) {
            const functionCall = message.tool_calls[0];
            if (functionCall.function.name === 'updateChart') {
                const args = JSON.parse(functionCall.function.arguments);
                updateChart(args.chartType);
                // Update the dropdown menu to reflect the chart type
                const chartTypeSelect = document.getElementById('chartType');
                chartTypeSelect.value = args.chartType;
                addMessageToChat(`Chart updated to ${args.chartType} type.`, 'assistant');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('Sorry, there was an error processing your request.', 'assistant');
    }
}

// Add event listeners for chat
document.getElementById('send-button').addEventListener('click', handleChatSubmit);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleChatSubmit();
    }
});
