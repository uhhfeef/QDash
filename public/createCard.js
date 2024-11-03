export function createCard(title, value) {
    // Create the container div with stats card styling
    const container = document.createElement('div');
    container.className = 'bg-white p-4 rounded-lg shadow';
    const uniqueId = `chart-${Date.now()}`; 
    container.id = uniqueId;

    // Create a wrapper div for better control of the title
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'w-full flex justify-center';
    
    // Update title element. This is to make sure the css is applied correctly
    const titleElement = document.createElement('div');
    titleElement.className = 'text-gray-500 text-sm font-medium mb-2 text-center';
    titleElement.style.textAlign = 'center';
    titleElement.textContent = title;
    
    // Proper DOM structure
    titleWrapper.appendChild(titleElement);
    container.appendChild(titleWrapper);

    const data = [{
        type: 'indicator',
        value: value,
        title: { text: "" }, // Remove title from Plotly (we're using our own)
        mode: "number",
        number: {
            font: { size: 24, color: "#111827" }
        }
    }];

    const layout = {
        width: null,  // Make it responsive
        height: 100,  // Reduced height since we have our own title
        margin: { t: 25, b: 0, l: 25, r: 25 },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white',
        showlegend: false,
    };

    // Append to the stats-card-grid
    const statsGrid = document.querySelector('.stats-card-grid');
    statsGrid.appendChild(container);
    
    // Create the plot
    Plotly.newPlot(uniqueId, data, layout, {responsive: true});
}