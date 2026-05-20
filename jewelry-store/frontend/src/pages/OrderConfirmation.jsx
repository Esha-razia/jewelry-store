import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(location.state?.order || null);
  const [customer, setCustomer] = useState(location.state?.customer || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order || !user?.token || !orderNumber) {
      if (order) setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const isMongoId = /^[a-f0-9]{24}$/i.test(orderNumber);
        const url = isMongoId
          ? `/api/orders/${orderNumber}`
          : `/api/orders/by-number/${orderNumber}`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [order, user, orderNumber]);

  if (loading) {
    return (
      <div className="order-confirm-page">
        <p className="text-muted" style={{ textAlign: 'center', padding: '4rem 0' }}>
          Loading your confirmation…
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirm-page">
        <p style={{ textAlign: 'center', marginBottom: '1rem' }}>Order not found.</p>
        <div style={{ textAlign: 'center' }}>
          <Link to="/track-order" className="btn btn-primary">
            Track an order
          </Link>
        </div>
      </div>
    );
  }

  const displayName =
    customer?.firstName ||
    (order.user?.name || '').split(/\s+/)[0] ||
    'there';
  const paymentLabel = (order.paymentMethod || '').split('·')[0]?.trim() || order.paymentMethod;
  const streetLine = customer
    ? [customer.address, customer.apartment].filter(Boolean).join(', ')
    : order.shippingAddress?.address?.split('\n')[1] || order.shippingAddress?.address;
  const fullName = customer
    ? `${customer.firstName} ${customer.lastName}`.trim()
    : order.shippingAddress?.address?.split('\n')[0] || order.user?.name;

  return (
    <div className="order-confirm-page fade-in">
      <style>{`
        .order-confirm-page {
          max-width: 560px;
          margin: 0 auto 3rem;
          padding: 0 1rem 2rem;
        }
        .order-confirm-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }
        .order-confirm-icon {
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 2px solid var(--accent-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-gold);
        }
        .order-confirm-id {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0 0 0.35rem;
          letter-spacing: 0.04em;
        }
        .order-confirm-title {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 600;
          line-height: 1.25;
        }
        .order-confirm-card {
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 1.25rem 1.35rem;
          margin-bottom: 1rem;
          background: var(--bg-secondary);
        }
        .order-confirm-card h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          font-weight: 600;
        }
        .order-confirm-card p {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.92rem;
          line-height: 1.55;
        }
        .order-confirm-details h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 600;
        }
        .order-confirm-block {
          margin-bottom: 1.1rem;
        }
        .order-confirm-block:last-child {
          margin-bottom: 0;
        }
        .order-confirm-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--text-muted);
          margin: 0 0 0.35rem;
        }
        .order-confirm-value {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.55;
          white-space: pre-line;
        }
        .order-confirm-items {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }
        .order-confirm-item {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 0.65rem;
          font-size: 0.9rem;
        }
        .order-confirm-item img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
        }
        .order-confirm-total {
          display: flex;
          justify-content: space-between;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
          font-weight: 600;
        }
        .order-confirm-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
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
        <span style={{ color: 'var(--text-main)' }}>Order confirmed</span>
      </nav>

      <div className="order-confirm-header">
        <div className="order-confirm-icon" aria-hidden>
          <CheckCircle2 size={28} />
        </div>
        <div>
          <p className="order-confirm-id">Confirmation #{order.orderNumber || orderNumber}</p>
          <h1 className="order-confirm-title">Thank you, {displayName}!</h1>
        </div>
      </div>

      <div className="order-confirm-card">
        <h3>Your order is confirmed</h3>
        <p>{paymentLabel}</p>
      </div>

      <div className="order-confirm-card">
        <h3>Order updates</h3>
        <p>You&apos;ll get shipping and delivery updates by email.</p>
      </div>

      <div className="order-confirm-card order-confirm-details">
        <h3>Order details</h3>

        <div className="order-confirm-block">
          <p className="order-confirm-label">Contact information</p>
          <p className="order-confirm-value">
            {customer?.email || order.user?.email}
            {customer?.phone ? `\n${customer.phone}` : ''}
          </p>
        </div>

        <div className="order-confirm-block">
          <p className="order-confirm-label">Shipping address</p>
          <p className="order-confirm-value">
            {fullName}
            {'\n'}
            {streetLine}
            {'\n'}
            {customer?.city || order.shippingAddress?.city}{' '}
            {customer?.postalCode || order.shippingAddress?.postalCode}
            {'\n'}
            {customer?.country || order.shippingAddress?.country}
          </p>
        </div>

        <div className="order-confirm-block">
          <p className="order-confirm-label">Payment method</p>
          <p className="order-confirm-value">{order.paymentMethod}</p>
        </div>

        <div className="order-confirm-items">
          <p className="order-confirm-label">Order summary</p>
          {(order.orderItems || []).map((item, idx) => (
            <div key={`${item.product || item.name}_${idx}`} className="order-confirm-item">
              {item.image ? <img src={item.image} alt="" /> : null}
              <span>
                {item.name} × {item.qty} — Rs. {Number(item.price).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="order-confirm-total">
            <span>Total</span>
            <span>Rs. {Number(order.totalPrice).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="order-confirm-actions">
        <Link
          to={`/track-order?orderNumber=${order.orderNumber || orderNumber}&email=${encodeURIComponent(customer?.email || order.user?.email || '')}`}
          className="btn btn-primary"
        >
          Track this order
        </Link>
        <Link to="/" className="btn btn-outline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
