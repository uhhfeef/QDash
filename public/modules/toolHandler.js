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
 * - Line chart creation
 * - Message handling for tool results
 * 
 * @example
 * import { handleToolCall } from './modules/toolHandler.js';
 * await handleToolCall(toolCall, messages);
 */

import { addMessageToChat } from './uiUtils.js';
import { executeSqlQuery } from '/sqlQuery.js';
import { createChart } from '/createChart.js';
import { createSpace } from '/createSpace.js';
import { createCard } from '/createCard.js';

export async function handleToolCall(toolCall, messages) {
    const args = JSON.parse(toolCall.function.arguments);
    let toolResult;
    
    switch (toolCall.function.name) {
       
            
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


        case 'createChart':
            const id = await createSpace('chart');
            createChart(id, args.x, args.y, args.chartType, args.title, args.xAxisTitle, args.yAxisTitle);
            toolResult = { success: true, message: 'Chart created successfully' };
            addMessageToChat(`Creating chart with provided data.`, 'assistant');
            break;

        case 'createCard':
            const cardId = await createSpace('card');
            createCard(cardId, args.title, args.value);
            toolResult = { success: true, message: 'Card created successfully' };
            addMessageToChat(`Creating card with provided data.`, 'assistant');
            break;
    }

    messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
    });

    return toolResult;
} 