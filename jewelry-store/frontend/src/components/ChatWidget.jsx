import { useContext, useState, useRef, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';
import { MessageSquare, X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatWidget = () => {
  const { isOpen, toggleChat, messages, sendMessage, isTyping } = useContext(ChatContext);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputVal.trim() !== '') {
      sendMessage(inputVal);
      setInputVal('');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={toggleChat}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '60px', height: '60px', borderRadius: '50%',
          backgroundColor: 'var(--accent-gold)', color: '#000',
          border: 'none', cursor: 'pointer', zIndex: 1000,
          boxShadow: '0 8px 32px rgba(212,175,55,0.4)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          transition: 'transform 0.3s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
         {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'fixed', bottom: '6rem', right: '2rem',
          width: '350px', height: '500px', zIndex: 999,
          display: 'flex', flexDirection: 'column',
          backgroundColor: 'rgba(20,20,20,0.95)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(212,175,55,0.1)' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.2rem' }}>JEWELSAFA AI</h3>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Jewelry Assistant</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: msg.sender === 'user' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: msg.sender === 'user' ? '#000' : '#fff',
                  fontSize: '0.9rem', borderTopRightRadius: msg.sender === 'user' ? '0' : '12px',
                  borderTopLeftRadius: msg.sender === 'ai' ? '0' : '12px'
                }}>
                  {msg.text}
                </div>

                {/* AI Rich Payloads */}
                {msg.type === 'products' && msg.payload && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {msg.payload.map(p => (
                      <Link to={`/product/${p.slug || p._id}`} key={p._id} style={{ minWidth: '120px', background: '#000', borderRadius: '8px', overflow: 'hidden' }} onClick={toggleChat}>
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                        <div style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                          <div style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{p.name}</div>
                          <div className="text-gold">Rs. {p.price}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {msg.type === 'order_status' && msg.payload && (
                   <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem' }}>
                     <strong>Total: </strong> Rs. {msg.payload.totalPrice} <br/>
                     <strong>Date: </strong> {new Date(msg.payload.createdAt).toLocaleDateString()}
                   </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>JEWELSAFA is thinking...</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)' }} onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              style={{ flex: 1, padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px' }} 
            />
            <button type="submit" style={{ background: 'var(--accent-gold)', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#000' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
