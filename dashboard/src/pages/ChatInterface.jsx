import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FiSend, FiUser, FiZap } from 'react-icons/fi';
import { API_BASE_URL, authHeaders } from '../config';

const prompts = [
  'Where is order ORD-5521?',
  'What is my loyalty status?',
  'I received a damaged item',
  'Show public APIs for weather data',
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: 'Hi, I can answer customer, order, complaint, and public API discovery questions.',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [customerId, setCustomerId] = useState('CUST-001');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (event, overrideText) => {
    event?.preventDefault();
    const text = (overrideText || inputValue).trim();
    if (!text || loading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    const history = messages.map((message) => ({
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: message.text,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/query`,
        { query: text, customerId: customerId || 'GUEST', sessionId, conversationHistory: history },
        { headers: authHeaders }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          text: response.data.message,
          sender: 'ai',
          intent: response.data.intent,
          data: response.data.data,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          text: 'I could not reach the support API on 8086. Run npm run api in the dashboard folder and try again.',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-layout">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">Interactive assistant</p>
          <h1>Support Chatbot</h1>
          <p>Intent routing, customer lookup, order lookup, complaint capture, and public API discovery.</p>
        </div>
        <label className="customer-field">
          <FiUser aria-hidden="true" />
          <input value={customerId} onChange={(event) => setCustomerId(event.target.value)} placeholder="Customer ID" />
        </label>
      </header>

      <div className="prompt-row">
        {prompts.map((prompt) => (
          <button key={prompt} onClick={(event) => sendMessage(event, prompt)} disabled={loading}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="message-list">
        {messages.map((message) => (
          <article key={message.id} className={`message ${message.sender}`}>
            <div className="message-avatar">{message.sender === 'user' ? <FiUser /> : <FiZap />}</div>
            <div className="message-bubble">
              <p>{message.text}</p>
              {message.intent && <span className="tag">{message.intent}</span>}
              {message.data && Object.keys(message.data).length > 0 && (
                <pre>{JSON.stringify(message.data, null, 2)}</pre>
              )}
              <small>{message.timestamp}</small>
            </div>
          </article>
        ))}
        {loading && <div className="state-panel slim">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form className="composer" onSubmit={sendMessage}>
        <input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Ask about an order, customer, complaint, or public API..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !inputValue.trim()} title="Send message">
          <FiSend aria-hidden="true" />
        </button>
      </form>
    </section>
  );
};

export default ChatInterface;
