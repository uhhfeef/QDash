export function createCard(title, value, trend) {
    const valueToDisplay = Array.isArray(value) ? value[0] : value;
    const isNumeric = !isNaN(valueToDisplay) && valueToDisplay !== '';
    
    // Create the container div with stats card styling
    const container = document.createElement('div');
    container.className = 'bg-white p-4 rounded-lg overflow-visible';
    
    // Create and append title elements
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'w-full flex justify-center';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'text-gray-500 text-sm font-medium mb-2 text-center';
    titleElement.textContent = title;
    
    titleWrapper.appendChild(titleElement);
    container.appendChild(titleWrapper);

    // Create plot wrapper
    const plotWrapper = document.createElement('div');
    plotWrapper.style.width = '100%';
    plotWrapper.style.height = '100px';
    const plotId = `plot-${Date.now()}`;
    plotWrapper.id = plotId;
    container.appendChild(plotWrapper);

    // Create trend display
    if (trend !== undefined && trend !== null) {
        const trendWrapper = document.createElement('div');
        trendWrapper.className = 'w-full flex justify-center mt-2';
        
        const trendElement = document.createElement('div');
        const trendValue = typeof trend === 'number' ? trend.toFixed(1) : trend;
        const isPositive = !isNaN(parseFloat(trendValue)) && parseFloat(trendValue) > 0;
        const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
        const trendArrow = isPositive ? '↑' : '↓';
        
        trendElement.className = `text-sm font-medium ${trendColor}`;
        trendElement.textContent = `${trendArrow}${Math.abs(trendValue)}% vs last month`;
        
        trendWrapper.appendChild(trendElement);
        container.appendChild(trendWrapper);
    }

    // Append container to the stats grid
    const statsGrid = document.querySelector('.stats-card-grid');
    statsGrid.appendChild(container);

    if (!isNumeric) {
        // Not using Plotly for text values. Some display error.
        const textDiv = document.createElement('div');
        textDiv.className = 'text-gray-900 font-inter text-center h-full flex items-center justify-center';
        textDiv.style.height = '100px';
        textDiv.style.fontSize = '36px';
        textDiv.textContent = valueToDisplay;
        plotWrapper.appendChild(textDiv);
    } else {
        // Use Plotly for numeric values
        const data = [{
            type: 'indicator',
            mode: "number",
            value: valueToDisplay,
            title: { text: "" },
            number: {
                font: { 
                    size: 36,
                    color: "#111827",
                    family: "Inter, system-ui, sans-serif",
                    weight: "600"
                },
                valueformat: ",d"
            }
        }];

        const layout = {
            height: 100,
            margin: { t: 0, b: 0, l: 0, r: 0 },  
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            autosize: true
        };

        // Create the plot only for numeric values
        Plotly.newPlot(plotId, data, layout, {
            responsive: true,
            displayModeBar: false,
            staticPlot: true
        });
    }
}