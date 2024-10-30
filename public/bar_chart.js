// Function to load and process the CSV data
async function loadOrderData() {
    try {
        const response = await fetch('/data/orders.csv');
        const csvText = await response.text();
        
        // Parse CSV and count orders by day
        const dayCount = new Array(7).fill(0);
        csvText.split('\n').slice(1).forEach(row => {
            if (row) {
                const order_dow = row.split(',')[4]; 
                if (!isNaN(parseInt(order_dow))) {
                    dayCount[parseInt(order_dow)]++;
                }
            }
        });

        // Create simple bar chart
        const data = [{
            x: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            y: dayCount,
            type: 'bar'
        }];

        const layout = {
            title: 'Orders by Day of Week',
            yaxis: { title: 'Number of Orders' }
        };

        Plotly.newPlot('barChart', data, layout);

    } catch (error) {
        console.error('Error:', error);
    }
}

// Load the chart when page loads
document.addEventListener('DOMContentLoaded', loadOrderData);
