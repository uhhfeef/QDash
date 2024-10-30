import { handleChatSubmit } from './chatHandler.js';


// Sample data
const rawData = [65, 59, 80, 81, 56, 55, 72, 68, 75, 63, 58, 78, 82, 60, 71];

// Function to create different types of traces based on chart type
function createTrace(type) {
    const baseTrace = {
        x: rawData,
        marker: {
            color: 'rgba(54, 162, 235, 0.5)',
            line: {
                color: 'rgba(54, 162, 235, 1)',
                width: 1
            }
        }
    };

    switch (type) {
        case 'histogram':
            return {
                ...baseTrace,
                type: 'histogram',
                nbinsx: 7
            };
        case 'bar':
            return {
                ...baseTrace,
                type: 'bar',
                y: rawData,
                x: Array.from({length: rawData.length}, (_, i) => `Data ${i+1}`),
            };
        case 'line':
            return {
                ...baseTrace,
                type: 'scatter',
                y: rawData,
                x: Array.from({length: rawData.length}, (_, i) => `Data ${i+1}`),
                mode: 'lines+markers'
            };
        case 'pie':
            return {
                values: rawData,
                labels: Array.from({length: rawData.length}, (_, i) => `Data ${i+1}`),
                type: 'pie'
            };
        default:
            return baseTrace;
    }
}

// Function to create layout based on chart type
function createLayout(type) {
    const baseLayout = {
        title: 'Data Distribution',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 50, r: 20, b: 50, l: 50 }
    };

    if (type === 'pie') {
        return {
            ...baseLayout,
            height: 500 // Adds a height to the pie chart   
        };
    }

    return {
        ...baseLayout,
        xaxis: {
            title: type === 'histogram' ? 'Values' : 'Data Points', // chooses values if histogram, otherwise data points   
            tickfont: { size: 12 }
        },
        yaxis: {
            title: type === 'histogram' ? 'Frequency' : 'Values', // chooses frequency if histogram, otherwise values   
            tickfont: { size: 12 }
        },
        bargap: 0.05
    };
}

// Function to update the chart
function updateChart(type) {
    const trace = createTrace(type);
    const layout = createLayout(type);
    Plotly.newPlot('myChart', [trace], layout, {responsive: true});
}

// Event listener for dropdown changes
document.getElementById('chartType').addEventListener('change', (e) => {
    updateChart(e.target.value);
});

// Initial chart creation
updateChart('histogram');



