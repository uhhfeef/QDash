export function showError(message) {
    addMessageToChat(`Error: ${message}`, 'assistant');
}

export function addMessageToChat(content, role) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `message flex w-full mb-4 ${
        role === 'user' ? 'justify-end' : 'justify-start'
    }`;
    
    const innerDiv = document.createElement('div');
    innerDiv.className = `max-w-[70%] rounded-lg p-3 ${
        role === 'user' 
            ? 'bg-blue-500 text-white ml-auto' 
            : 'bg-gray-200 text-gray-800'
    }`;
    innerDiv.textContent = content;
    
    messageDiv.appendChild(innerDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function setupEventListeners({ handleChatSubmit, handleCsvUpload, updateTools }) {
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('chat-input');
    const csvUpload = document.getElementById('csv-upload');
    
    if (sendButton) {
        sendButton.addEventListener('click', () => handleChatSubmit());
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleChatSubmit();
            }
        });
    }

    if (csvUpload) {
        csvUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await handleCsvUpload(file);
                    await updateTools();
                    addMessageToChat(`Successfully loaded ${file.name}`, 'assistant');
                } catch (error) {
                    console.error('Error uploading CSV:', error);
                    showError(`Failed to upload CSV: ${error.message}`);
                }
            }
        });
    }
}