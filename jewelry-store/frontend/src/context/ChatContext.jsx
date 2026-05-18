import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Aurora, your AI jewelry assistant. Are you looking for something specific, or checking an order?", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useContext(AuthContext);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (text) => {
    // Add user message
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setIsTyping(true);

    try {
      const { data } = await axios.post('/api/chat', { 
        message: text,
        userId: user ? user._id : null
      });

      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: data.text, 
          sender: 'ai',
          type: data.type,
          payload: data.payload 
        }]);
        setIsTyping(false);
      }, 1000); // simulate thinking
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{ isOpen, toggleChat, messages, sendMessage, isTyping }}>
      {children}
    </ChatContext.Provider>
  );
};
