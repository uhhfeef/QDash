export async function createSpace() {
    // Create the container div with stats card styling
    const container = document.createElement('div');
    container.className = 'bg-white p-4 rounded-3xl shadow overflow-visible';
    container.id = `chart-${Date.now()}`;

    // Create a separate div for the Plotly chart inside the container
    const plotlyDiv = document.createElement('div');
    plotlyDiv.id = `plotly-${container.id}`;
    container.appendChild(plotlyDiv);  // Add the Plotly div inside the container

    const chartContainer = document.querySelector('.chart-container');
    chartContainer.appendChild(container);

    return plotlyDiv.id; 

}