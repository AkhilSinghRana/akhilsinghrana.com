document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatModal = document.getElementById('chatModal');

    chatModal.addEventListener('shown.bs.modal', function() {
        chatMessages.innerHTML = ''; // Clear previous messages
        displayWelcomeMessage();
    });

    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            addMessage('You', message);
            userInput.value = '';
            try {
                const response = await sendMessageToAPI(message);
                addMessage('Bot', response);
            } catch (error) {
                console.error('Error:', error);
                addMessage('Bot', 'Sorry, there was an error processing your request.');
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

    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'mb-2';
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function displayWelcomeMessage() {
        const welcomeMessages = [
            "Welcome! I am your Assistant.",
            "Feel free to ask me anything about this website or anything from web.",
            "Some sample quetions.\n",
            "Tell me more about Akhil.\n",
            "What is this website about.",
            "What is Akhil's Education\n",
            "What publications has Akhil written?",
            
        ];
        addMessage('Bot', welcomeMessages.join(' '));
    }
});