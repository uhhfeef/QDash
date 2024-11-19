// Removed Plotly import since it's loaded from CDN

export function createChart(id, x, y, chartType, title, xAxisTitle, yAxisTitle) {
    // console.log("Creating chart with xAxisTitle:", xAxisTitle);
    // console.log("yAxisTitle:", yAxisTitle);
    

    let trace;
    let layout;

    if (chartType === 'pie') {
        console.log("Creating pie chart with x:", x, "and y:", y);
        trace = {
            type: 'pie',
            values: y,
            labels: x,
            marker: {
                colors: y.map((_, index) => 
                    `hsl(${index * (360 / y.length)}, 70%, 50%)`
                )
            }
        };    

        // layout for pie chart
        layout = {
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
        trace = { 
            x: x,
            y: y,
            type: chartType
        };

        // layout for other charts
        layout = {
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
