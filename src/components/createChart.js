// Removed Plotly import since it's loaded from CDN
import { addDeleteButton } from '../modules/uiUtils.js';

export function createChart(id, x, y, chartType, title, xAxisTitle, yAxisTitle) {
    // Create a wrapper div for the chart and delete button
    const existingElement = document.getElementById(id);
    const wrapperDiv = document.createElement('div');
    wrapperDiv.style.position = 'relative';
    wrapperDiv.style.marginBottom = '20px';
    
    // Create the chart container
    const chartDiv = document.createElement('div');
    chartDiv.id = `${id}-plot`;
    wrapperDiv.appendChild(chartDiv);
    
    // Add delete button using the utility function
    addDeleteButton(wrapperDiv, id);
    
    // Replace the existing element with our wrapper
    existingElement.parentNode.replaceChild(wrapperDiv, existingElement);

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
            title: {
                text: title,
                font: { size: 16 },
                xref: 'paper',
                x: 0.5,
                xanchor: 'center',
                yref: 'paper',
                y: 1,
                yanchor: 'bottom',
                pad: { t: 10 },
                wrap: true
            },
            autosize: true,
            height: Math.floor((window.innerHeight - 8 * 16) * 0.6),
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
            type: chartType,
            text: chartType === 'bar' ? y : undefined,
            marker: {
                color: 'rgb(38, 98, 217)'
            },
            line: chartType === 'line' ? {
                shape: 'spline',
                color: 'rgb(38, 98, 217)'
            } : undefined,
            fill: chartType === 'line' ? 'tozeroy' : undefined,
            fillcolor: chartType === 'line' ? 'rgba(38, 98, 217, 0.2)' : undefined
        };

        // layout for other charts
        layout = {
            title: {
                text: title,
                font: { size: 16 },
                xref: 'paper',
                x: 0.5,
                xanchor: 'center',
                yref: 'paper',
                y: 1,
                yanchor: 'bottom',
                pad: { t: 10 },
                wrap: true
            },
            xaxis: {
                title: {
                    text: xAxisTitle,
                    standoff: 40,
                    y: -0.2  // Position below the axis
                },
                tickangle: -45  // Angle the tick labels if they're long
            },
            yaxis: {
                title: {
                    text: yAxisTitle,
                    standoff: 30
                }
            },
            barcornerradius: 8,
            autosize: true,
            height: Math.floor((window.innerHeight - 8 * 16) * 0.6),
            margin: {
                l: 60,
                r: 30,
                t: 40,
                b: 100  // Increased even more to accommodate angled labels and title
            }
        };
    }

    // Render the Plotly chart in the chart div
    Plotly.newPlot(`${id}-plot`, [trace], layout, {responsive: true});
    console.log("Chart created with x:", x, "and y:", y);
}
