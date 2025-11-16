const chatContainer = document.getElementById("chat-container");
const promptForm = document.getElementById("prompt-form");
const promptInput = document.getElementById("prompt-input");
const suggestionArea = document.getElementById("suggestion-area"); // NEW

/**
 * Creates and appends a new chat message to the chat container.
 * @param {string} message - The text content of the message.
 * @param {string} type - The type of message ('user' or 'ai').
 */
function appendMessage(message, type) {
    let chatBoxHTML;
    if (type === 'user') {
        chatBoxHTML = `
            <div class="user-chat-area">
                ${message}
            </div>
            <img src="../assets/images/user2.png" alt="User Avatar" class="avatar">
        `;
    } else {
        chatBoxHTML = `
            <img src="../assets/images/medical-robot.png" alt="AI Avatar" class="avatar">
            <div class="ai-chat-area">
                ${message}
            </div>
        `;
    }
    const chatBox = document.createElement('div');
    chatBox.classList.add(type === 'user' ? 'user-chat-box' : 'ai-chat-box');
    chatBox.innerHTML = chatBoxHTML;
    chatContainer.appendChild(chatBox);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Creates a "loading" bubble for the AI.
 * @returns {HTMLElement} The loading bubble element.
 */
function showLoadingBubble() {
    const loadingHTML = `
        <img src="../assets/images/medical-robot.png" alt="AI Avatar" class="avatar">
        <div class="ai-chat-area">
            <img src="../assets/images/fading_circles_transparent.gif" alt="Loading..." class="load" width="50px">
        </div>
    `;
    const loadingBox = document.createElement('div');
    loadingBox.classList.add('ai-chat-box');
    loadingBox.innerHTML = loadingHTML;
    chatContainer.appendChild(loadingBox);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return loadingBox;
}

/**
 * This function now gets a REAL response from our Express backend.
 * @param {string} userMessage - The message the user sent.
 * @param {HTMLElement} loadingBubble - The loading bubble to replace.
 */
async function getFakeAiResponse(userMessage, loadingBubble) {
    const backendUrl = "http://localhost:3000/api/chat"; 

    try {
        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: userMessage }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const aiMessage = data.response;


        const finalHTML = `
            <img src="../assets/images/medical-robot.png" alt="AI Avatar" class="avatar">
            <div class="ai-chat-area">
                ${aiMessage}
            </div>
        `;
        loadingBubble.innerHTML = finalHTML;

    } catch (error) {
        console.error("Error fetching from backend:", error);
        const errorHTML = `
            <img src="../assets/images/medical-robot.png" alt="AI Avatar" class="avatar">
            <div class="ai-chat-area">
                Sorry, something went wrong. Please try again later.
                (Error: ${error.message})
            </div>
        `;
        loadingBubble.innerHTML = errorHTML;
    }
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Handles the logic of sending a message (from user or suggestion).
 * @param {string} message
 */
function sendMessage(message) {
    appendMessage(message, 'user');

    promptInput.value = "";

    suggestionArea.style.display = 'none'; 

    const loadingBubble = showLoadingBubble();

    getFakeAiResponse(message, loadingBubble);
}


/**
 * Handles the submission of the user's message from the form.
 * @param {Event} e - The form submission event.
 */
function handleChatSubmit(e) {
    e.preventDefault();
    
    const userMessage = promptInput.value.trim();
    if (!userMessage) return; 

    sendMessage(userMessage);
}


promptForm.addEventListener("submit", handleChatSubmit);



/**
 * Handles clicks on the suggestion chips using event delegation.
 * @param {Event} e - The click event.
 */
suggestionArea.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-chip')) {
        const message = e.target.textContent; 
        sendMessage(message); 
    }
});