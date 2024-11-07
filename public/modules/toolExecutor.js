
import { addMessageToChat } from './uiUtils.js';
// import { executeSqlQuery } from '../services/sqlQuery.js';  // Comment out or remove this line
import { executeDuckDbQuery } from '../services/duckDbService.js';
import { createChart } from '../components/createChart.js';
import { createSpace } from '../components/createSpaceForCharts.js';
import { createCard } from '../components/createCard.js';
import { createPieChart } from '../components/createPieChart.js';
import { createStackedBarChart } from '../components/createStackedBarChart.js';
export async function handleToolCall(toolCall, messages) {
    const args = JSON.parse(toolCall.function.arguments);
    let toolResult;
    
    switch (toolCall.function.name) {
        case 'executeSqlQuery':
            const queryResult = await executeDuckDbQuery(args.query);
            if (queryResult && queryResult.length > 0) {
                window.x = queryResult.map(row => Object.values(row)[0]);
                window.y = queryResult.map(row => Object.values(row)[1]);
                console.log('Query results - x:', window.x, 'y:', window.y);
                toolResult = { message: "Query has received results and has been saved in window.x and window.y. Do NOT execute any more queries. Give this result to the next tool." };
            }
            addMessageToChat(`Executed query: ${args.query}`, 'assistant');
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
            const id = await createSpace();
            createChart(id, window.x, window.y, args.chartType, args.title, args.xAxisTitle, args.yAxisTitle);
            toolResult = { success: true, message: 'Chart created successfully' };
            addMessageToChat(`Creating chart with provided data.`, 'assistant');
            break;

        case 'createStackedBarChart':
            const stackedBarChartId = await createSpace();
            createStackedBarChart(stackedBarChartId, window.x, window.y, args.stackBy, args.title, args.xAxisTitle, args.yAxisTitle);
            toolResult = { success: true, message: 'Stacked bar chart created successfully' };
            addMessageToChat(`Creating stacked bar chart with provided data.`, 'assistant');
            break;

        case 'createPieChart':
            const pieChartId = await createSpace();
            // The LLM can decide on an sql query that either genrates x as values and y as labels or vice versa. So we need to check which one is which.
            const values = typeof window.x[0] === 'number' ? window.x : window.y;
            const labels = typeof window.x[0] === 'number' ? window.y : window.x;
            createPieChart(pieChartId, values, labels, args.title);
            toolResult = { success: true, message: 'Pie chart created successfully' };
            addMessageToChat(`Creating pie chart with provided data.`, 'assistant');
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