document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    
    // Initial greeting
    setTimeout(() => {
        addBotMessage("Welcome to Food Express! How can I help you today?", [
            "View Menu",
            "Place Order",
            "Track Order"
        ]);
    }, 500);

    // Send on Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });

    // Send on Button Click
    sendBtn.addEventListener('click', handleSend);

    function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;
        
        addUserMessage(text);
        chatInput.value = '';
        
        // Process bot response
        processBotResponse(text);
    }

    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user';
        msgDiv.innerText = text;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    // Expose globally for option buttons
    window.addBotMessage = function(text, options = []) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerText = text;
        
        if (options.length > 0) {
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'chatbot-options';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'chatbot-option';
                btn.innerText = opt;
                btn.onclick = () => {
                    addUserMessage(opt);
                    processBotResponse(opt);
                };
                optionsContainer.appendChild(btn);
            });
            msgDiv.appendChild(optionsContainer);
        }
        
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
        
        // Voice response (Optional - un-comment if you want the bot to speak back)
        // speakText(text);
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function processBotResponse(userInput) {
        const text = userInput.toLowerCase();
        
        // Simulate typing delay
        setTimeout(() => {
            if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
                addBotMessage("Hello! What would you like to do?", ["View Menu", "Place Order", "Track Order"]);
            
            } else if (text.includes('menu') || text.includes('view menu') || text.includes('food')) {
                const categories = JSON.parse(localStorage.getItem('categories')) || ["Pizza", "Burger", "Pasta", "Drinks", "Desserts"];
                const categoryListStr = categories.join(", ");
                const quickButtons = categories.slice(0, 4);
                
                addBotMessage(`We have ${categoryListStr}. What are you craving?`, quickButtons);
                
            } else if (text.includes('add')) {
                // E.g., "Add Margherita"
                const itemName = userInput.replace(/add/i, '').trim();
                // Find in menuItems (assumes menu.js is loaded)
                if (typeof menuItems !== 'undefined') {
                    const item = menuItems.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()));
                    if (item) {
                        addToCart(item.id); // Call global addToCart
                        addBotMessage(`Added ${item.name} to your cart. Anything else?`, ["View Cart", "Menu"]);
                    } else {
                        addBotMessage("Sorry, I couldn't find that item. Try picking from the menu.", ["View Menu"]);
                    }
                } else {
                    addBotMessage("Menu data is currently unavailable.");
                }

            } else if (text === 'go to cart' || text === 'view cart') {
                window.location.href = 'cart.html';

            } else if (text.includes('cart') || text.includes('place order')) {
                addBotMessage("You can view your cart and checkout here.", ["Go to Cart"]);
                
            } else if (text === 'go to orders' || text === 'track order') {
                window.location.href = 'orders.html';

            } else if (text.includes('track') || text.includes('order status') || text.includes('history') || text.includes('orders') || text.includes('order')) {
                addBotMessage("You can view your past orders in the Orders section.", ["Go to Orders"]);
                
            } else {
                // Dynamic Category Matching
                const categories = JSON.parse(localStorage.getItem('categories')) || ["Pizza", "Burger", "Pasta", "Drinks", "Desserts"];
                // Match "dessert" with "Desserts", etc. Use root words or inclusive matching
                let matchedCategory = categories.find(c => text.includes(c.toLowerCase()) || (c.toLowerCase() === 'desserts' && text.includes('desert')));
                
                if (matchedCategory && typeof menuItems !== 'undefined') {
                    const items = menuItems.filter(i => i.category === matchedCategory);
                    if (items.length > 0) {
                        let msg = `Available ${matchedCategory}:\n`;
                        let buttons = [];
                        items.forEach((item, idx) => {
                            msg += `${idx + 1}. ${item.name} (₹${item.price})\n`;
                            buttons.push(`Add ${item.name}`);
                        });
                        addBotMessage(msg, buttons.slice(0, 4));
                    } else {
                        addBotMessage(`Sorry, we don't have any items in ${matchedCategory} right now.`);
                    }
                } else {
                    addBotMessage("I'm not sure how to help with that. Please choose an option below.", [
                        "View Menu", "View Cart", "Track Order"
                    ]);
                }
            }
        }, 600);
    }

    // --- Web Speech API (Voice Chatbot) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        
        let isRecording = false;

        recognition.onstart = function() {
            isRecording = true;
            micBtn.classList.add('recording');
        };

        recognition.onresult = function(event) {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;
            chatInput.value = transcript;
            handleSend();
        };

        recognition.onend = function() {
            isRecording = false;
            micBtn.classList.remove('recording');
        };

        recognition.onerror = function(event) {
            console.error(event.error);
            isRecording = false;
            micBtn.classList.remove('recording');
        };

        micBtn.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        micBtn.style.display = 'none'; // Hide if not supported
    }
    
    // Simple Text-to-Speech (Optional, left here for reference)
    function speakText(text) {
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance(text);
            speech.volume = 1;
            speech.rate = 1;
            speech.pitch = 1;
            window.speechSynthesis.speak(speech);
        }
    }
});
