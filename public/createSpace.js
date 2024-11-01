export async function createSpace(type = 'chart') {
    console.log('Creating space...');
    const newSection = document.createElement('div');
    const uniqueId = `${type}-${Date.now()}`; 
    console.log('Unique ID:', uniqueId);

    newSection.id = uniqueId;
    
    // Add appropriate classes based on type
    if (type === 'card') {
        newSection.classList.add('card-container');
    } else {
        newSection.classList.add('chart-container');
    }
    
    document.querySelector('.chart-container').appendChild(newSection);
    return uniqueId; 
}