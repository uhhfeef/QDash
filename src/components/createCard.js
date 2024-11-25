import { addDeleteButton } from '../modules/uiUtils.js';

export function createCard(title, value, trend) {
    const valueToDisplay = Array.isArray(value) ? value[0] : value;
    const isNumeric = !isNaN(valueToDisplay) && valueToDisplay !== '';
    
    // Create the container div with stats card styling
    const container = document.createElement('div');
    container.className = 'bg-white p-6 rounded-3xl shadow-lg border border-gray-200 overflow-visible flex flex-col min-h-[10rem]';
    container.id = `card-${Date.now()}`;
    
    // Create wrapper div for positioning delete button
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex flex-col flex-1 relative';
    
    // Add delete button using the utility function
    addDeleteButton(contentWrapper, container.id);
    
    // Create and append title elements
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'w-full';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'text-gray-500 text-sm font-medium text-center';
    titleElement.textContent = title;
    
    titleWrapper.appendChild(titleElement);
    
    // Create plot wrapper
    const plotWrapper = document.createElement('div');
    plotWrapper.className = 'flex-1 flex items-center justify-center';
    const plotId = `plot-${Date.now()}`;
    plotWrapper.id = plotId;

    // Create trend display
    let trendWrapper;
    if (trend !== undefined && trend !== null) {
        trendWrapper = document.createElement('div');
        trendWrapper.className = 'w-full flex justify-center mt-2';
        
        const trendElement = document.createElement('div');
        const trendValue = typeof trend === 'number' ? trend.toFixed(1) : trend;
        const isPositive = !isNaN(parseFloat(trendValue)) && parseFloat(trendValue) > 0;
        const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
        const trendArrow = isPositive ? '↑' : '↓';
        
        trendElement.className = `text-sm font-medium ${trendColor}`;
        trendElement.textContent = `${trendArrow}${Math.abs(trendValue)}% vs last month`;
        
        trendWrapper.appendChild(trendElement);
    }

    if (!isNumeric) {
        const textDiv = document.createElement('div');
        textDiv.className = 'text-gray-900 font-inter text-4xl font-semibold';
        textDiv.textContent = valueToDisplay;
        plotWrapper.appendChild(textDiv);
    } else {
        const numberDiv = document.createElement('div');
        numberDiv.className = 'text-gray-900 font-inter text-4xl font-semibold';
        numberDiv.textContent = new Intl.NumberFormat().format(valueToDisplay);
        plotWrapper.appendChild(numberDiv);
    }
    
    // Move all content into the wrapper instead of the container
    contentWrapper.appendChild(titleWrapper);
    contentWrapper.appendChild(plotWrapper);
    if (trendWrapper) {
        contentWrapper.appendChild(trendWrapper);
    }
    
    // Add the wrapper to the container
    container.appendChild(contentWrapper);

    // Append container to the stats grid
    const statsGrid = document.querySelector('.stats-card-grid');
    statsGrid.appendChild(container);
}