export async function createSpace(chartType) {
    console.log('Creating space...');
    const newSection = document.createElement('div');
    const uniqueId = `chart-${Date.now()}`; 
    console.log('Unique ID:', uniqueId);

    newSection.id = uniqueId;
    if (chartType === 'card') {
        newSection.classList.add('card-container');
    } else {
        newSection.classList.add('chart-container');
    }
    document.querySelector('.chart-container').appendChild(newSection);
    return uniqueId; 
}