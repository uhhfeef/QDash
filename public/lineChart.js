function createLineChart(x, y) {
    var trace = { 
        x: x,
        y: y,
        type: 'line'
    };

    var layout = {
        title: 'Line Chart',
        xaxis: {title: 'X Axis'},
        yaxis: {title: 'Y Axis'}
    };

    Plotly.newPlot('lineChart', [trace], layout, {responsive: true});
    console.log("Line Chart created with x:", x, "and y:", y);
}

