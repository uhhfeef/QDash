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

import Plotly from 'plotly.js-dist'; // Added import for Plotly

export function createChart(id, x, y, chartType, title, xAxisTitle, yAxisTitle) {
    var trace = { 
        x: x,
        y: y,
        type: chartType
    };

    var layout = {
        title: title,
        xaxis: {title: xAxisTitle},
        yaxis: {title: yAxisTitle},
        autosize: true
    };

    Plotly.newPlot(id, [trace], layout, {responsive: true});
    console.log("Chart created with x:", x, "and y:", y);
}

