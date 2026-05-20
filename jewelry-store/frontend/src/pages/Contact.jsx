import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Mail, ChevronRight, Loader2, Truck, RotateCcw } from 'lucide-react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/contact', { name, email, message });
      setFeedback(data.message || 'Sent!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in container" style={{ paddingBottom: '4rem', maxWidth: '900px', margin: '0 auto' }}>
      <nav className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)' }}>Contact</span>
      </nav>

      <div style={{ display: 'grid', gap: '2.5rem', gridTemplateColumns: '1fr', alignItems: 'start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={28} style={{ color: 'var(--accent-gold)' }} />
            Contact JEWELSAFA
          </h1>
          <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: '520px' }}>
            Questions about an order, sizing, or styling? Send us a note — our team replies within one business day.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              maxWidth: '520px',
            }}
          >
            <div>
              <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>Name</label>
              <input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>Email</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>Message</label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                minLength={5}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-main)', resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 0.75s linear infinite' }} /> : null}
              {loading ? 'Sending…' : 'Send message'}
            </button>
          </form>

          {feedback && (
            <p style={{ marginTop: '1rem', color: 'var(--accent-gold-hover)' }}>{feedback}</p>
          )}
          {error && (
            <p role="alert" style={{ marginTop: '1rem', color: '#ff6b6b' }}>{error}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <section id="shipping" style={{ padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Truck size={20} style={{ color: 'var(--accent-gold)' }} /> Shipping policy
            </h2>
            <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
              We pack every piece with care and send tracking details by email once your order ships. Typical handling is <strong style={{ color: 'var(--text-main)' }}>1–3 business days</strong>; carriers may vary by destination. For status, use Track order with your order ID and account email.
            </p>
          </section>

          <section id="returns" style={{ padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <RotateCcw size={20} style={{ color: 'var(--accent-gold)' }} /> Returns &amp; exchanges
            </h2>
            <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
              Unworn items in original condition may be exchanged or returned within <strong style={{ color: 'var(--text-main)' }}>14 days of delivery</strong>. Contact us with your order ID so we can help. Custom or engraved pieces are final sale.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;
