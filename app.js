/**
 * UI Orchestrator for the Customer Support Agent
 */

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const typingIndicator = document.getElementById('typing-indicator');
const clearChatBtn = document.getElementById('clear-chat');

/**
 * Adds a message bubble to the chat container
 */
function addMessage(text, role, timestamp = null) {
    const time = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(role === 'user' ? 'user-message' : 'bot-message');
    
    messageDiv.innerHTML = `
        ${text}
        <span class="timestamp">${time}</span>
    `;

    // Insert before typing indicator
    chatMessages.insertBefore(messageDiv, typingIndicator);
    
    // Auto-scroll to bottom
    scrollToBottom();
}

/**
 * Scrolls the chat container to the bottom
 */
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Shows/Hides the typing indicator
 */
function setTyping(isTyping) {
    typingIndicator.style.display = isTyping ? 'flex' : 'none';
    if (isTyping) scrollToBottom();
}

/**
 * Handle form submission
 */
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;

    // 1. Add user message to UI
    addMessage(message, 'user');
    userInput.value = '';

    // 2. Show typing indicator
    setTyping(true);

    try {
        // 3. Process message through the Agent System
        const response = await window.SupportAgent.processMessage(message);

        // 4. Hide typing indicator
        setTyping(false);

        // 5. Add bot response to UI
        addMessage(response.text, 'bot', response.timestamp);

    } catch (error) {
        console.error("Agent Error:", error);
        setTyping(false);
        addMessage("I'm sorry, I encountered an internal error. Please try again.", 'bot');
    }
});

/**
 * Clear Chat History
 */
clearChatBtn.addEventListener('click', () => {
    const messages = chatMessages.querySelectorAll('.message');
    messages.forEach((msg, index) => {
        if (index > 0) msg.remove(); // Keep the first welcome message
    });
    window.SupportAgent.memory = [];
});

// Focus input on load
window.addEventListener('load', () => {
    userInput.focus();
});
