/**
 * Multi-Agent System Logic for Customer Support
 */

const KNOWLEDGE_BASE = {
    billing: {
        keywords: ['payment', 'billing', 'invoice', 'charge', 'refund', 'price', 'subscription', 'cost', 'pay', 'checkout', 'receipt', 'card', 'visa', 'mastercard', 'paypal', 'wallet'],
        responses: [
            "I can assist with your billing inquiry. You can manage your payment methods and view past invoices in the 'Billing & Subscription' tab of your profile.",
            "Regarding refunds: Our policy allows for full refunds within 30 days of purchase if the service hasn't been extensively used. Would you like to start a request?",
            "If you're seeing an unexpected charge, please check if you have any active trials or automated renewals enabled in your account settings."
        ]
    },
    technical: {
        keywords: ['error', 'bug', 'broken', 'not working', 'slow', 'crash', 'app', 'technical', 'help', 'fix', 'loading', 'api', 'integration', 'connect', 'timeout', 'failed', 'issue', 'glitch'],
        responses: [
            "It sounds like a technical glitch. I recommend first clearing your browser's local storage and cookies to see if that resolves the issue.",
            "To help our engineering team investigate, could you tell me which browser you're using and if there's a specific error message on the screen?",
            "If the application is unresponsive, please try a hard refresh (Ctrl+F5 or Cmd+Shift+R). If it persists, I can log a ticket for our technical team."
        ]
    },
    account: {
        keywords: ['login', 'password', 'account', 'profile', 'email', 'reset', 'sign in', 'access', 'username', 'logout', 'mfa', '2fa', 'security', 'verify', 'credentials', 'signup'],
        responses: [
            "For security reasons, password resets must be initiated through the 'Forgot Password' link on the sign-in page. You'll receive a secure link via email.",
            "You can update your security settings, including enabling Two-Factor Authentication (2FA), in the 'Security' section of your account.",
            "If you've lost access to your primary email, please provide your account's recovery token or contact our verification department directly."
        ]
    },
    sales: {
        keywords: ['buy', 'purchase', 'demo', 'enterprise', 'pricing', 'plan', 'quote', 'custom', 'sales', 'upgrade', 'business', 'partnership', 'consultation'],
        responses: [
            "I'd be happy to put you in touch with our Sales team. Are you interested in our Enterprise plan or a custom solution for your business?",
            "We offer a 15-minute product demo for new business clients. Would you like to see our calendar to book a session?",
            "Our current pricing plans range from Basic to Pro. You can find a detailed comparison on our 'Pricing' page. Shall I take you there?"
        ]
    },
    general: {
        keywords: ['hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye', 'who are you', 'help', 'options', 'features', 'what can you do'],
        responses: [
            "Hello! I am the Nexus AI Assistant. I can help you with Billing, Technical Support, Account Management, or Sales inquiries. How can I assist?",
            "You're very welcome! Let me know if there's anything else I can clarify for you.",
            "I'm designed to provide rapid support. You can ask me about resetting passwords, fixing app errors, viewing invoices, or our enterprise pricing."
        ]
    }
};

class CustomerSupportAgent {
    constructor() {
        this.memory = [];
        this.userName = "Valued Customer";
    }

    /**
     * Classification Agent: Improved with weighted scoring and niche keyword boosts
     */
    classifyIntent(message) {
        const lowerMsg = message.toLowerCase().replace(/[^\w\s]/g, '');
        const words = lowerMsg.split(/\s+/);
        
        let bestCategory = 'unknown';
        let highestScore = 0;

        const weights = {
            enterprise: 5, // Very specific
            refund: 5,
            billing: 4,
            demo: 5,
            error: 4,
            password: 5,
            login: 4,
            reset: 3
        };

        for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
            let score = 0;
            
            data.keywords.forEach(keyword => {
                const weight = weights[keyword] || 2;
                
                if (words.includes(keyword)) {
                    score += weight;
                } else if (lowerMsg.includes(keyword)) {
                    score += weight * 0.5;
                }
            });

            if (score > highestScore) {
                highestScore = score;
                bestCategory = category;
            } else if (score === highestScore && highestScore > 0) {
                // Tie-breaking: favor more specific categories over 'general'
                if (category !== 'general') bestCategory = category;
            }
        }

        return highestScore >= 2 ? bestCategory : 'unknown';
    }

    /**
     * Response Agent: Returns a relevant response based on category
     */
    generateResponse(category) {
        if (category === 'unknown') {
            return this.escalate();
        }

        const responses = KNOWLEDGE_BASE[category].responses;
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }

    /**
     * Escalation Agent: Handles fallback logic
     */
    escalate() {
        return "I'm not quite sure I understand your request. I've logged this and am escalating it to a human support representative. They will get back to you shortly. In the meantime, can I help with billing, technical, or account issues?";
    }

    /**
     * Memory Agent: Adds message to session history
     */
    updateMemory(role, text) {
        this.memory.push({
            role,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    }

    /**
     * Main Process: Orchestrates the agents
     */
    async processMessage(userMessage) {
        // 1. Input Agent (handled by UI)
        this.updateMemory('user', userMessage);

        // Simulate "thinking" time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // 2. Classification Agent
        const category = this.classifyIntent(userMessage);

        // 3. Response Agent (and potentially Escalation Agent)
        const botResponse = this.generateResponse(category);

        // 4. Memory Agent
        this.updateMemory('bot', botResponse);

        return {
            category,
            text: botResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    getHistory() {
        return this.memory;
    }
}

// Export for use in app.js
window.SupportAgent = new CustomerSupportAgent();
