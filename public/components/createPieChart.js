
export function createPieChart(id, values, labels, title) {
    var trace = { 
        values: values,
        labels: labels,
        type: 'pie'
    };

    var layout = {
        title: title,
        autosize: true
    };

    Plotly.newPlot(id, [trace], layout, {responsive: true});
    console.log("Chart created with values:", values, "and labels:", labels);
}

