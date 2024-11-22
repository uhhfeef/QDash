/**
 * @fileoverview Manages chat state and core chat functionality
 */

export const MAX_ITERATIONS = 10;

export function createChatManager() {
    const chatMessages = [];

    function formatHistory() {
        return chatMessages.map(msg => 
            `${msg.role}: ${msg.content}`
        ).join('\n');
    }

    function getInitialMessages(userMessage) {
        return [
            {
                "role": "system", 
                "content": "You are a helpful assistant. Let's think step by step. If the user just wants to have a natural conversation, you should not use the sql tool but you must always say 'DONE' at the end of your message. You don't need to explain what you're going to do before using the SQL tool. You can use the sql tool to fetch data from the database. You can also use the chart tool to create charts. For pie chart, values would be in x and labels for the values in y. Even though you can execute SQL queries using the sql tool, you dont have access to the data output from the sql tool. If you need to convert data from one chart type to another, you dont need to call the sql tool again and again to fetch the same data. You must always call only 1 function at a time, tool_calls must always be a 1 array. You will NEVER GENERATE RANDOM X AND Y VALUES for the chart tool. You will always double check and think step by step before you call the chart tool. If you're done with all steps, explicitly state 'DONE' at the end of your message. NEVER EVER INSERT OR DELETE FROM THE TABLE"
            },
            {
                "role": "user", 
                "content": userMessage + " [Context - Previous messages:\n]" + formatHistory()
            }
        ];
    }

    function addMessage(message) {
        chatMessages.push(message);
    }

    return {
        getInitialMessages,
        addMessage
    };
} 