document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatModal = document.getElementById('chatModal');

    chatModal.addEventListener('shown.bs.modal', function() {
        chatMessages.innerHTML = '';
        displayWelcomeMessage();
    });

    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            addMessage('You', message, 'user-message');
            userInput.value = '';
            
            // Add thinking indicator
            const thinkingId = addThinkingIndicator();
            
            try {
                const response = await sendMessageToAPI(message);
                // Remove thinking indicator
                removeThinkingIndicator(thinkingId);
                addMessage('Bot', response, 'bot-message');
            } catch (error) {
                console.error('Error:', error);
                // Remove thinking indicator
                removeThinkingIndicator(thinkingId);
                addMessage('Bot', 'Sorry, there was an error processing your request.', 'bot-message');
            }
        }
    });

    async function sendMessageToAPI(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });
        if (!response.ok) {
            throw new Error('API request failed');
        }
        const data = await response.json();
        return data.response;
    }

    function addMessage(sender, message, className) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${className}`;
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addThinkingIndicator() {
        const thinkingElement = document.createElement('div');
        thinkingElement.className = 'message bot-message thinking';
        thinkingElement.innerHTML = '<div class="thinking-dots"><span>.</span><span>.</span><span>.</span></div>';
        chatMessages.appendChild(thinkingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return thinkingElement.id = 'thinking-' + Date.now(); // Unique ID for the thinking indicator
    }

    function removeThinkingIndicator(id) {
        const thinkingElement = document.getElementById(id);
        if (thinkingElement) {
            thinkingElement.remove();
        }
    }

    function displayWelcomeMessage() {
        const welcomeMessages = [
            "Welcome! I am your Assistant.",
            "Feel free to ask me anything about this website or anything from web.",
            "Some sample questions:",
            "• Tell me more about Akhil.",
            "• What is this website about?",
            "• What education does Akhil have?",
            "• What publications has Akhil written?"
        ];
        addMessage('Bot', welcomeMessages.join('\n'), 'bot-message');
    }
});