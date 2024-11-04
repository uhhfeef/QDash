/**
 * @fileoverview Tool execution handler module
 * @module toolHandler
 * 
 * @requires ./uiUtils
 * @requires ../lineChart
 * @requires ../sqlQuery
 * 
 * @description
 * Handles execution of various tools available to the AI:
 * - SQL query execution
 * - Line / Bar chart creation
 * - Message handling for tool results
 * 
 * @example
 * import { handleToolCall } from './modules/toolHandler.js';
 * await handleToolCall(toolCall, messages);
 */

import { addMessageToChat } from './uiUtils.js';
import { executeSqlQuery } from '../services/sqlQuery.js';
import { createChart } from '../components/createChart.js';
import { createSpace } from '../components/createSpace.js';
import { createCard } from '../components/createCard.js';

export async function handleToolCall(toolCall, messages) {
    const args = JSON.parse(toolCall.function.arguments);
    let toolResult;
    
    switch (toolCall.function.name) {
        case 'executeSqlQuery':
            const queryResult = await executeSqlQuery(args.query);
            if (queryResult && queryResult.length > 0) {
                window.x = queryResult.map(row => Object.values(row)[0]);
                window.y = queryResult.map(row => Object.values(row)[1]);
                console.log('Query results - x:', window.x, 'y:', window.y);
                toolResult = { message: "Query has received results and has been saved in window.x and window.y. Do NOT execute any more queries. Give this result to the next tool." };
            }
            // addMessageToChat(`Query has received results. Give this result to the next tool.`, 'assistant');
            break;

        case 'createCard':
            console.log("x:", window.x);
            console.log("x:", window.x[0], "type:", typeof window.x[0]);
            const value = window.x[0];
            createCard(args.title, value);
            toolResult = { success: true, message: 'Card created successfully' };
            addMessageToChat(`Creating card with provided data.`, 'assistant');
            break;

        case 'createChart':
            const id = await createSpace('chart');
            createChart(id, window.x, window.y, args.chartType, args.title, args.xAxisTitle, args.yAxisTitle);
            toolResult = { success: true, message: 'Chart created successfully' };
            addMessageToChat(`Creating chart with provided data.`, 'assistant');
            break;
    }

    // Tool result is sent to the next tool. The next iteration starts with the tool result and previous messages as context.
    messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
    });

    return toolResult;
} 