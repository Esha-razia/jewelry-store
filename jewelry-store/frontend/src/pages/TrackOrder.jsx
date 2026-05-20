import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PackageSearch,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Circle,
  Truck,
  MapPin,
} from 'lucide-react';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fromUrl = searchParams.get('orderNumber') || searchParams.get('orderId');
    const fromEmail = searchParams.get('email');
    if (fromUrl) setOrderId(fromUrl);
    if (fromEmail) setEmail(fromEmail);
  }, [searchParams]);

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

  const tracking = order?.tracking;

  return (
    <div className="track-page fade-in">
      <style>{`
        .track-page {
          max-width: 680px;
          margin: 0 auto;
          padding-bottom: 3rem;
        }
        .track-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
        }
        .track-form label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 0.4rem;
          color: var(--text-muted);
        }
        .track-form input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-primary);
          color: var(--text-main);
        }
        .track-summary {
          margin-top: 2rem;
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          background: var(--bg-secondary);
          overflow: hidden;
        }
        .track-summary-hero {
          padding: 1.35rem 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(212, 175, 55, 0.06);
        }
        .track-summary-hero h2 {
          margin: 0 0 0.35rem;
          font-size: 1.15rem;
        }
        .track-summary-hero p {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.92rem;
          line-height: 1.5;
        }
        .track-dates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        @media (max-width: 520px) {
          .track-dates { grid-template-columns: 1fr; }
        }
        .track-date-card {
          padding: 0.85rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-primary);
        }
        .track-date-card span {
          display: block;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          margin-bottom: 0.3rem;
        }
        .track-date-card strong {
          font-size: 0.95rem;
        }
        .track-timeline {
          padding: 1.25rem 1.5rem 1.5rem;
        }
        .track-timeline h3 {
          margin: 0 0 1rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--text-muted);
        }
        .track-step {
          display: flex;
          gap: 0.85rem;
          position: relative;
          padding-bottom: 1.25rem;
        }
        .track-step:last-child {
          padding-bottom: 0;
        }
        .track-step:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 11px;
          top: 26px;
          bottom: 0;
          width: 2px;
          background: var(--border-subtle);
        }
        .track-step.complete:not(:last-child)::before {
          background: var(--accent-gold);
        }
        .track-step-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          margin-top: 2px;
        }
        .track-step-icon.complete {
          color: var(--accent-gold);
        }
        .track-step-icon.current {
          color: var(--accent-gold);
        }
        .track-step-icon.upcoming {
          color: var(--text-muted);
          opacity: 0.5;
        }
        .track-step-body h4 {
          margin: 0 0 0.2rem;
          font-size: 0.95rem;
          font-weight: 600;
        }
        .track-step-body h4.current {
          color: var(--accent-gold);
        }
        .track-step-body p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.45;
        }
        .track-step-date {
          font-size: 0.8rem;
          color: var(--text-main);
          margin-top: 0.25rem;
        }
        .track-items {
          padding: 1rem 1.5rem 1.35rem;
          border-top: 1px solid var(--border-subtle);
        }
        .track-item-row {
          display: flex;
          gap: 0.65rem;
          align-items: center;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .track-item-row img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid var(--border-subtle);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 0.75s linear infinite; }
      `}</style>

      <nav
        className="text-muted"
        style={{
          fontSize: '0.8rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)' }}>Track order</span>
      </nav>

      <h1
        style={{
          fontSize: '2rem',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <PackageSearch size={28} style={{ color: 'var(--accent-gold)' }} />
        Track your order
      </h1>
      <p className="text-muted" style={{ marginBottom: '1.75rem' }}>
        Enter your confirmation number and account email to see where your order is now and when it
        will ship and arrive.
      </p>

      <form className="track-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="track-order-id">Order ID</label>
          <input
            id="track-order-id"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. UKIJZZTFX"
            required
          />
        </div>
        <div>
          <label htmlFor="track-email">Account email</label>
          <input
            id="track-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.25rem',
          }}
        >
          {loading ? <Loader2 size={18} className="spin-icon" /> : null}
          {loading ? 'Looking up…' : 'Track order'}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ marginTop: '1.25rem', color: '#ff6b6b', fontSize: '0.95rem' }}>
          {error}
        </p>
      )}

      {order && tracking && (
        <section className="track-summary">
          <div className="track-summary-hero">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Order <strong style={{ color: 'var(--text-main)' }}>#{order.orderNumber || order._id}</strong>
              {' · '}
              Placed {tracking.placedAt}
            </p>
            <h2>{tracking.currentLabel}</h2>
            <p>{tracking.currentDetail}</p>
          </div>

          <div className="track-dates">
            <div className="track-date-card">
              <span>
                <Truck size={12} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                Expected shipment
              </span>
              <strong>{tracking.estimatedShipDate}</strong>
            </div>
            <div className="track-date-card">
              <span>
                <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                Expected delivery
              </span>
              <strong>{tracking.estimatedDeliveryWindow}</strong>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {tracking.shippingMethod}
              </p>
            </div>
          </div>

          <div className="track-timeline">
            <h3>Tracking timeline</h3>
            {(tracking.timeline || []).map((step) => (
              <div key={step.key} className={`track-step ${step.state}`}>
                <div className={`track-step-icon ${step.state}`}>
                  {step.state === 'complete' ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <Circle size={24} fill={step.state === 'current' ? 'currentColor' : 'none'} />
                  )}
                </div>
                <div className="track-step-body">
                  <h4 className={step.state === 'current' ? 'current' : ''}>{step.label}</h4>
                  <p>{step.description}</p>
                  {step.state === 'complete' && step.date ? (
                    <p className="track-step-date">{step.date}</p>
                  ) : null}
                  {step.state !== 'complete' && step.estimatedDate ? (
                    <p className="track-step-date">
                      {step.state === 'current' ? 'Expected: ' : 'Est. '}
                      {step.estimatedDate}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="track-items">
            <p
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                marginBottom: '0.75rem',
              }}
            >
              Items in this order · ${Number(order.totalPrice).toFixed(2)} total
            </p>
            {(order.orderItems || []).map((it, idx) => (
              <div key={`${it.name}_${idx}`} className="track-item-row">
                {it.image ? <img src={it.image} alt="" /> : null}
                <span>
                  {it.name} × {it.qty} — ${Number(it.price).toFixed(2)} each
                </span>
              </div>
            ))}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Ship to: {order.shippingAddress?.city}, {order.shippingAddress?.country}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Payment:{' '}
              {order.isPaid ? `Confirmed (${order.paymentMethod})` : order.paymentMethod}
            </p>
          </div>
        </section>
      )}

      {order && !tracking && (
        <section
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
          }}
        >
          <p className="text-muted">Tracking details are unavailable for this order. Please try again later.</p>
        </section>
      )}
    </div>
  );
};

export default TrackOrder;
