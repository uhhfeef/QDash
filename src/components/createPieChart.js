// Remove Plotly import since it's loaded from CDN

export function createPieChart(id, values, labels, title) {
    const trace = {
        values: values,
        labels: labels,
        type: 'pie',
        marker: {
            colors: labels.map((_, index) => 
                `hsl(${index * (360 / labels.length)}, 70%, 50%)`
            )
        }
    };

    const layout = {
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
}
