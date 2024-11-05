import Plotly from 'plotly.js-dist'; // Added import for Plotly

export function createPieChart(id, values, labels, title) {
    var trace = { 
        values: values,
        labels: labels,
        type: 'pie'
    };

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

    Plotly.newPlot(id, [trace], layout, {responsive: true});
    console.log("Chart created with values:", values, "and labels:", labels);
}

