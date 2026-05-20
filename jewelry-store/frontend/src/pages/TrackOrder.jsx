import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PackageSearch, ChevronRight, Loader2 } from 'lucide-react';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/orders/track', {
        orderId: orderId.trim(),
        email: email.trim(),
      });
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not find this order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell fade-in" style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '3rem' }}>
      <nav className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)' }}>Track order</span>
      </nav>

      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PackageSearch size={28} style={{ color: 'var(--accent-gold)' }} />
        Track your order
      </h1>
      <p className="text-muted" style={{ marginBottom: '1.75rem' }}>
        Enter the order ID shown after checkout plus the email on your account (the same email you use to sign in when you ordered).
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
        }}
      >
        <div>
          <label htmlFor="track-order-id" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
            Order ID
          </label>
          <input
            id="track-order-id"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. 665a1b2c3d4e5f6789abcdef"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
            }}
          />
        </div>
        <div>
          <label htmlFor="track-email" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
            Account email
          </label>
          <input
            id="track-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
            }}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          {loading ? <Loader2 size={18} className="spin-icon" /> : null}
          {loading ? 'Looking up…' : 'Track order'}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ marginTop: '1.25rem', color: '#ff6b6b', fontSize: '0.95rem' }}>
          {error}
        </p>
      )}

      {order && (
        <section style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Status
          </p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.25rem' }}>
            <li style={{ marginBottom: '0.35rem' }}>
              <strong>Payment:</strong>{' '}
              {order.isPaid ? <>Paid ({order.paymentMethod})</> : 'Pending confirmation'}
            </li>
            <li style={{ marginBottom: '0.35rem' }}>
              <strong>Delivery:</strong>{' '}
              {order.isDelivered ? <>Shipped / delivered</> : 'Preparing shipment'}
            </li>
            <li>
              <strong>Total:</strong> ${Number(order.totalPrice).toFixed(2)}
            </li>
          </ul>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Ship to: {order.shippingAddress?.address}, {order.shippingAddress?.city} {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(order.orderItems || []).map((it, idx) => (
              <div key={`${it.name}_${idx}`} style={{ fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {it.image && (
                  <img src={it.image} alt="" width={44} height={44} style={{ objectFit: 'cover', borderRadius: '6px' }} />
                )}
                <span>
                  {it.name} × {it.qty} — ${Number(it.price).toFixed(2)} each
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 0.75s linear infinite; }
      `}</style>
    </div>
  );
};

export default TrackOrder;
