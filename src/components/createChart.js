// Removed Plotly import since it's loaded from CDN

export function createChart(id, x, y, chartType, title, xAxisTitle, yAxisTitle) {
    // console.log("Creating chart with xAxisTitle:", xAxisTitle);
    // console.log("yAxisTitle:", yAxisTitle);
    

    if (chartType === 'pie') {
        const trace = {
            type: 'pie',  // Moving type to the top level
            values: x,
            labels: y,
            // marker: {
            //     colors: y.map((_, index) => 
            //         `hsl(${index * (360 / y.length)}, 70%, 50%)`
            //     )
            // }
        };    

        // layout for pie chart
        var layout = {
            title: title,
            autosize: true,
            height: 350,
            margin: {
                l: 30,
                r: 30,
                t: 40,
                b: 30
            }
        };
    } else {
        var trace = { 
            x: x,
            y: y,
            type: chartType
        };

        // layout for other charts
        var layout = {
            title: title,
            xaxis: {
                title: {
                    text: xAxisTitle
                }
            },
            yaxis: {
                title: {
                    text: yAxisTitle
                }
            },
            autosize: true
        };
    }

    // Render the Plotly chart in the inner div
    Plotly.newPlot(id, [trace], layout, {responsive: true});
    console.log("Chart created with x:", x, "and y:", y);
}
