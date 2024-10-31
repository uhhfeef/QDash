/**
 * @fileoverview Line chart creation module
 * @module lineChart
 * 
 * @requires plotly.js
 * 
 * @description
 * Handles creation and rendering of line charts:
 * - Creates line charts using Plotly.js
 * - Configures chart layout and styling
 * - Manages chart responsiveness
 * 
 * @example
 * import { createLineChart } from './lineChart.js';
 * createLineChart([1,2,3], [10,20,30]);
 */

export function createChart(x, y, chartType, title, xAxisTitle, yAxisTitle) {
    var trace = { 
        x: x,
        y: y,
        type: chartType
    };

    var layout = {
        title: title,
        xaxis: {title: xAxisTitle},
        yaxis: {title: yAxisTitle}
    };

    Plotly.newPlot('lineChart', [trace], layout, {responsive: true});
    console.log("Line Chart created with x:", x, "and y:", y);
}

