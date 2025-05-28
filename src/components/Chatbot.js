import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Bot } from 'lucide-react'; // Bot icon
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm PharmAssist. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inactivityTimer = useRef(null);

  const jungleGreen = '#A5B68D';  // Jungle green color
  const brown = '#8B4513';        // Brown color

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      resetInactivityTimer();
    }
    return () => clearTimeout(inactivityTimer.current);
  }, [isOpen, input]);

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setIsOpen(false);
    }, 60000); // 1 minute = 60000 ms
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) resetInactivityTimer();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    resetInactivityTimer();

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are PharmAssist, a friendly pharmacy assistant chatbot offering medication advice and general health tips.' },
            ...messages,
            userMessage
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json'
          }
        }
      );

      const botReply = response.data.choices[0].message.content.trim();
      const botMessage = { role: 'assistant', content: botReply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process your request. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ zIndex: 9999, position: 'fixed', bottom: '20px', right: '20px' }}>
      {/* Floating Button */}
      {!isOpen && (
        <div
          onClick={toggleChat}
          style={{
            backgroundColor: jungleGreen,
            color: 'white',
            padding: '10px 15px',
            borderRadius: '30px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'bounce 2s infinite'
          }}
        >
          <Bot size={24} />
          <span style={{ fontWeight: '500', fontSize: '14px' }}>Need Help?</span>

          {/* Bounce animation keyframes */}
          <style>{`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-5px);
              }
              60% {
                transform: translateY(-3px);
              }
            }
          `}</style>
        </div>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '2px solid ' + jungleGreen
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: jungleGreen,
            color: 'white',
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} />
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>PharmAssist</span>
            </div>
            <button onClick={toggleChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div style={{
            flex: 1,
            padding: '10px',
            overflowY: 'auto',
            backgroundColor: '#f9fafb'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{
                  backgroundColor: msg.role === 'user' ? jungleGreen : '#f0e5d8', // Brownish white for bot
                  color: msg.role === 'user' ? 'white' : 'black',
                  borderRadius: '15px',
                  padding: '8px 12px',
                  maxWidth: '75%',
                  fontSize: '13px'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
                <div style={{
                  backgroundColor: '#f0e5d8',
                  color: 'black',
                  borderRadius: '15px',
                  padding: '8px 12px',
                  fontSize: '13px'
                }}>
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '8px',
            borderTop: '1px solid #ddd',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1px solid #ccc',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                backgroundColor: input.trim() ? jungleGreen : '#ccc',
                color: 'white',
                borderRadius: '50%',
                padding: '8px',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
