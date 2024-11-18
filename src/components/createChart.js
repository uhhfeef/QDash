// Removed Plotly import since it's loaded from CDN

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

    // Render the Plotly chart in the inner div
    Plotly.newPlot(id, [trace], layout, {responsive: true});
    console.log("Chart created with x:", x, "and y:", y);
}
