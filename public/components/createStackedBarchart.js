import Plotly from 'plotly.js-dist';

export function createStackedBarChart(id, x, y, stackBy, title, xAxisTitle, yAxisTitle) {
    console.log("xAxisTitle:", xAxisTitle);
    console.log("yAxisTitle:", yAxisTitle);
    // Group the data by stack categories
    const uniqueCategories = [...new Set(stackBy)];
    const traces = [];

    // Create a trace for each category
    uniqueCategories.forEach(category => {
        const indices = stackBy.map((val, idx) => val === category ? idx : -1).filter(idx => idx !== -1);
        const trace = {
            name: category,
            x: indices.map(idx => x[idx]),
            y: indices.map(idx => y[idx]),
            type: 'bar',
            hovertemplate: '%{y}<extra></extra>'
        };
        traces.push(trace);
    });

    const layout = {
        title: title,
        xaxis: {
            title: xAxisTitle,
            type: 'category'
        },
        yaxis: {
            title: yAxisTitle
        },
        barmode: 'stack',
        autosize: true,
        height: 350,
        margin: {
            l: 50,
            r: 30,
            t: 40,
            b: 50
        },
        showlegend: true,
        legend: {
            orientation: 'h',
            y: -0.2
        }
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot(id, traces, layout, config);
    console.log("Stacked bar chart created with categories:", uniqueCategories);
}
