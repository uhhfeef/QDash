import { LangfuseWeb } from "langfuse";

let langfuseWeb = null;

// Initialize Langfuse with configuration from server
async function initLangfuse() {
    try {
        const response = await fetch('/api/config/langfuse');
        const config = await response.json();
        langfuseWeb = new LangfuseWeb({
            publicKey: config.publicKey,
            baseUrl: "https://cloud.langfuse.com",
        });
        console.log('Langfuse initialized successfully');
    } catch (error) {
        console.error('Error initializing Langfuse:', error);
    }
}

// Initialize Langfuse when the module loads
initLangfuse();

const handleUserFeedback = async (traceId, value) => {
    try {
        console.log('Sending feedback for value:', value, 'and traceId:', traceId);
        if (!langfuseWeb) {
            console.log('Langfuse not initialized, retrying initialization...');
            await initLangfuse();
        }
        if (!langfuseWeb) {
            throw new Error('Failed to initialize Langfuse');
        }
        await langfuseWeb.score({
            traceId,
            name: "user_feedback",
            value,
        });
        console.log('Feedback sent successfully');
        await langfuseWeb.flushAsync();

    } catch (error) {
        console.error('Error sending feedback:', error);
    }
};

export function showError(message) {
    const container = document.getElementById('notification-container');
    
    // Clear any existing notifications
    if (container.firstChild) {
        container.firstChild.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex justify-between items-center transition-all duration-300 opacity-0';
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'ml-3 hover:text-red-800';
    closeButton.onclick = () => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    };
    
    notification.appendChild(messageSpan);
    notification.appendChild(closeButton);
    container.appendChild(notification);
    
    // Trigger fade in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

export function addMessageToChat(content, role, traceId) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `message flex w-full ${
        role === 'user' ? 'bg-gray-100 max-w-[90%] rounded-3xl py-2.5 ml-auto' : 'bg-white'
    }`;
    
    const innerDiv = document.createElement('div');
    innerDiv.className = `max-w-[90%] px-4 break-words whitespace-pre-wrap relative mx-auto w-full max-w-2xl text-gray-800`;

    // Check if the message contains an executed query
    if (content.startsWith('Executed query:')) {
        const [prefix, ...queryParts] = content.split('Executed query:');
        const query = queryParts.join('Executed query:').trim(); // Join back in case there are multiple colons
        const codeBlock = document.createElement('div');
        codeBlock.innerHTML = `Executed query:<pre class="bg-gray-700 text-white p-2 rounded-md mt-1 text-sm whitespace-pre-wrap"><code>${query}</code></pre>`;
        innerDiv.innerHTML = ''; // Clear the text content
        innerDiv.appendChild(codeBlock);
    } else {
        innerDiv.textContent = content;
    }

    // Add thumbs up/down buttons for messages containing 'DONE'
    if (content.includes('DONE') && role === 'assistant') {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'hidden group-hover:flex gap-2 absolute -bottom-2 -right-2 bg-white rounded-lg shadow-md p-1';
        
        const thumbsUp = document.createElement('button');
        thumbsUp.innerHTML = '👍';
        thumbsUp.className = 'hover:scale-110 transition-transform';
        thumbsUp.onclick = async (e) => {
            console.log('Thumbs up clicked');
            e.stopPropagation();
            thumbsUp.classList.add('selected');
            thumbsDown.classList.remove('selected');
            if (traceId) {
                await handleUserFeedback(traceId, 1);
            }
        };
        
        const thumbsDown = document.createElement('button');
        thumbsDown.innerHTML = '👎';
        thumbsDown.className = 'hover:scale-110 transition-transform';
        thumbsDown.onclick = async (e) => {
            e.stopPropagation();
            thumbsDown.classList.add('selected');
            thumbsUp.classList.remove('selected');
            if (traceId) {
                await handleUserFeedback(traceId, 0);
            }
        };
        
        feedbackDiv.appendChild(thumbsUp);
        feedbackDiv.appendChild(thumbsDown);
        innerDiv.appendChild(feedbackDiv);
        
        // Add group class to enable hover functionality
        innerDiv.classList.add('group', 'hover:shadow-lg');
    }
    
    messageDiv.appendChild(innerDiv);
    chatMessages.appendChild(messageDiv);
    
    // Smooth scroll to the bottom
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
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
        sendButton.addEventListener('click', () => {
            if (chatInput.value.trim()) {
                handleChatSubmit();
            }
        });
    }
    
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (chatInput.value.trim()) {
                    handleChatSubmit();
                }
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
            console.log('CSV file selected');
            const file = e.target.files[0];
            console.log(file);
            if (file) {
                const uploadLabel = document.getElementById('upload-label');
                if (uploadLabel) {
                    uploadLabel.textContent = 'Uploading...';
                }
                try {
                    const schema = await handleCsvUpload(file);
                    if (schema) {
                        updateTools();
                    } else {
                        e.target.value = ''; // Clear the file input if wrong headers
                    }
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