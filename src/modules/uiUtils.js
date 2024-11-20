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
    innerDiv.className = `max-w-[70%] rounded-lg p-3 break-words whitespace-pre-wrap ${
        role === 'user' 
            ? 'bg-blue-500 text-white ml-auto' 
            : 'bg-gray-200 text-gray-800'
    }`;
    innerDiv.textContent = content;
    
    messageDiv.appendChild(innerDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function autoResizeChatInput(element) {
    // Reset height to auto to get the correct scrollHeight
    element.style.height = 'auto';
    // Set new height based on scrollHeight
    element.style.height = `${element.scrollHeight}px`;
    // Set a maximum height if needed (e.g., 200px)
    const maxHeight = 200;
    if (element.scrollHeight > maxHeight) {
        element.style.height = `${maxHeight}px`;
        element.style.overflowY = 'auto';
    } else {
        element.style.overflowY = 'hidden';
    }
}

export function addDeleteButton(wrapperDiv, id) {
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '×';
    deleteButton.style.position = 'absolute';
    deleteButton.style.right = '10px';
    deleteButton.style.top = '10px';
    deleteButton.style.background = 'rgba(255, 255, 255, 0.8)';
    deleteButton.style.border = '1px solid #ddd';
    deleteButton.style.borderRadius = '50%';
    deleteButton.style.width = '24px';
    deleteButton.style.height = '24px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.fontSize = '18px';
    deleteButton.style.display = 'flex';
    deleteButton.style.alignItems = 'center';
    deleteButton.style.justifyContent = 'center';
    deleteButton.style.zIndex = '1000';
    
    // Add hover effect
    deleteButton.onmouseover = () => {
        deleteButton.style.background = 'rgba(255, 0, 0, 0.1)';
        deleteButton.style.border = '1px solid #ff0000';
    };
    deleteButton.onmouseout = () => {
        deleteButton.style.background = 'rgba(255, 255, 255, 0.8)';
        deleteButton.style.border = '1px solid #ddd';
    };
    
    // Add delete functionality
    deleteButton.onclick = () => {
        // Get the parent container before removing anything
        const parentContainer = wrapperDiv.parentElement;
        if (parentContainer && parentContainer.classList.contains('bg-white')) {
            parentContainer.remove();
        } else {
            // Fallback: remove wrapper and try to clean up other elements
            wrapperDiv.remove();
            const originalElement = document.getElementById(id);
            if (originalElement) {
                originalElement.remove();
            }
        }
    };
    
    wrapperDiv.appendChild(deleteButton);
    return deleteButton;
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
        
        // Add input and keyup event listeners for auto-resizing
        chatInput.addEventListener('input', () => autoResizeChatInput(chatInput));
        chatInput.addEventListener('keyup', () => autoResizeChatInput(chatInput));
        
        // Initial resize
        autoResizeChatInput(chatInput);
    }

    if (csvUpload) {
        csvUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const uploadLabel = document.getElementById('upload-label');
                if (uploadLabel) {
                    uploadLabel.textContent = 'Uploading...';
                }
                try {
                    await handleCsvUpload(file);
                    await updateTools();
                    // addMessageToChat(`Successfully loaded ${file.name}`, 'assistant');
                    if (uploadLabel) {
                        uploadLabel.textContent = 'Upload CSV';
                    }
                } catch (error) {
                    console.error('Error uploading CSV:', error);
                    showError(`Failed to upload CSV: ${error.message}`);
                    if (uploadLabel) {
                        uploadLabel.textContent = 'Upload CSV';
                    }
                }
            }
        });
    }
}