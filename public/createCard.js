export function createCard(id, title, value) {
    const data = [{
        type: 'indicator',
        value: value,
        title: title,
    }];

    const layout = {
        title: '',
        width: 300,
        height: 150,
        margin: { t: 30, b: 0, l: 30, r: 30 },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white'
    };

    
    Plotly.newPlot(id, data, layout, {responsive: true});
}