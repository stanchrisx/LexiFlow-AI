import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  Minimize2, 
  Bot, 
  User,
  Loader2,
  Sparkles
} from 'lucide-react';
import './PDFChatbot.css';

const PDFChatbot = ({ pdfData, currentPage, isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hi! I'm your AI assistant for "${pdfData?.title || 'this document'}". I can help you understand the content, answer questions, and provide summaries. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(userMessage.content);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Simple AI-like responses based on keywords
    if (input.includes('summary') || input.includes('summarize')) {
      return `Based on the current page (${currentPage}), this section discusses key concepts and methodologies. The document appears to cover important topics that are relevant to the overall theme. Would you like me to elaborate on any specific part?`;
    }
    
    if (input.includes('page') && input.includes('about')) {
      return `Page ${currentPage} contains detailed information about the topic at hand. The content includes several key points that build upon previous sections. Is there a particular aspect you'd like me to explain further?`;
    }
    
    if (input.includes('explain') || input.includes('what is')) {
      return `Great question! Based on the document content, I can help explain the concepts presented. The information on this page provides insights into the subject matter. Would you like me to break down any specific terminology or concepts?`;
    }
    
    if (input.includes('help') || input.includes('how')) {
      return `I'm here to help! I can assist you with:
      
• Summarizing pages or sections
• Explaining complex concepts
• Finding specific information
• Providing context about the content
• Answering questions about the document

What specific aspect would you like help with?`;
    }
    
    if (input.includes('find') || input.includes('search')) {
      return `I can help you find information in the document. Based on your query, you might want to check the sections that discuss related topics. Would you like me to guide you to specific pages or provide more targeted information?`;
    }
    
    // Default responses
    const defaultResponses = [
      `That's an interesting question about the document. Based on the content I can see, there are several relevant points to consider. Could you be more specific about what aspect you'd like to explore?`,
      `I understand you're asking about the document content. The information presented here covers various important topics. Would you like me to focus on a particular section or concept?`,
      `Good question! The document contains valuable information that I can help you understand better. What specific part would you like me to elaborate on?`,
      `I can help you with that! The content on page ${currentPage} and surrounding pages provides relevant information. Would you like me to explain any particular aspect in more detail?`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Summarize this page",
    "What's the main topic?",
    "Explain key concepts",
    "Find important points"
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={`pdf-chatbot ${isMinimized ? 'minimized' : ''}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-info">
          <div className="bot-avatar">
            <Bot size={16} />
          </div>
          <div className="header-text">
            <h3 className="bot-name">PDF Assistant</h3>
            <span className="bot-status">
              <div className="status-dot" />
              Online
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="header-button"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minimize2 size={16} />
          </button>
          <button 
            className="header-button"
            onClick={onToggle}
            title="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="chatbot-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="messages-container">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="message-avatar">
                    {message.type === 'bot' ? (
                      <Bot size={14} />
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="message bot typing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="message-avatar">
                      <Bot size={14} />
                    </div>
                    <div className="message-content">
                      <div className="message-bubble typing-bubble">
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="quick-questions">
                <div className="quick-questions-label">
                  <Sparkles size={12} />
                  Quick questions:
                </div>
                <div className="quick-questions-grid">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="quick-question-button"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="chatbot-input">
              <div className="input-container">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about this document..."
                  className="message-input"
                  rows={1}
                  disabled={isTyping}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  title="Send message"
                >
                  {isTyping ? (
                    <Loader2 size={16} className="spinning" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PDFChatbot;
