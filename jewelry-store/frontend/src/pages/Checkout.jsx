import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Lock } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [saveInfo, setSaveInfo] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const orderPlacedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if (user.email) setEmail(user.email);
  }, [user, navigate]);

  useEffect(() => {
    if (orderPlacedRef.current || orderComplete) return;
    if (user && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems.length, user, navigate, orderComplete]);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const standardShipping = itemsPrice > 100 ? 0 : 10;
  const expressShipping = 25;
  const shippingPrice =
    shippingMethod === 'express' ? expressShipping : standardShipping;
  const totalPrice = (itemsPrice + taxPrice + shippingPrice).toFixed(2);
  const itemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const buildShippingPayload = () => {
    const streetLine = [address, apartment].filter(Boolean).join(', ');
    const fullAddress = [
      `${firstName} ${lastName}`.trim(),
      streetLine,
      phone ? `Phone: ${phone}` : '',
      email ? `Email: ${email}` : '',
      province ? `Province: ${province}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return {
      address: fullAddress,
      city,
      postalCode,
      country,
    };
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (!user?.token) {
      setOrderError('Please sign in again to complete your order.');
      navigate('/auth');
      return;
    }

    if (!firstName.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      setOrderError('Please fill in all required delivery fields.');
      return;
    }

    if (cartItems.length === 0) {
      setOrderError('Your cart is empty. Add items before checking out.');
      return;
    }

    const orderItems = cartItems.map((item) => ({
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
      product: item.product || item._id,
    }));

    const missingProduct = orderItems.find((item) => !item.product);
    if (missingProduct) {
      setOrderError('A cart item is invalid. Remove it and add the product again from the shop.');
      return;
    }

    try {
      setIsProcessing(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const shippingLabel =
        shippingMethod === 'express' ? 'Express Delivery' : 'Standard Delivery';

      const orderData = {
        orderItems,
        shippingAddress: buildShippingPayload(),
        paymentMethod: `${paymentMethod} · ${shippingLabel}`,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice: Number(totalPrice),
      };

      const { data: createdOrder } = await axios.post('/api/orders', orderData, config);
      const confirmId = createdOrder.orderNumber || createdOrder._id;
      if (!confirmId) {
        throw new Error('Order was created but confirmation ID is missing. Check your profile for order history.');
      }

      orderPlacedRef.current = true;
      setOrderComplete(true);
      clearCart();
      navigate(`/order-confirmation/${confirmId}`, {
        replace: true,
        state: {
          order: createdOrder,
          customer: {
            firstName,
            lastName,
            email,
            phone,
            address,
            apartment,
            city,
            province,
            postalCode,
            country,
            paymentMethod,
            shippingMethod,
          },
        },
      });
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      if (msg?.includes('Not Found') && msg?.includes('/api/orders')) {
        setOrderError('Order service is unavailable. Restart the backend server and try again.');
      } else if (msg?.includes('Not authorized') || msg?.includes('token')) {
        setOrderError('Your session expired. Please sign in again.');
      } else {
        setOrderError(msg || 'Could not place your order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || (cartItems.length === 0 && !orderComplete)) {
    return null;
  }

  return (
    <div className="checkout-page fade-in">
      <style>{`
        .checkout-page {
          margin: 0 auto 4rem;
          max-width: 1180px;
        }
        .checkout-page * {
          box-sizing: border-box;
        }
        .checkout-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-bottom: 1.25rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .checkout-brand {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          letter-spacing: 0.12em;
          color: var(--accent-gold);
          text-decoration: none;
        }
        .checkout-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }
        .checkout-breadcrumb a {
          color: var(--text-muted);
          text-decoration: none;
        }
        .checkout-breadcrumb a:hover {
          color: var(--accent-gold);
        }
        .checkout-breadcrumb .active {
          color: var(--text-main);
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 400px;
          gap: 3rem;
          align-items: start;
        }
        .checkout-main {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .checkout-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .checkout-section-head h2 {
          margin: 0;
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: none;
        }
        .checkout-field label {
          display: block;
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 0.35rem;
          letter-spacing: 0.04em;
        }
        .checkout-field input,
        .checkout-field select {
          width: 100%;
          padding: 0.85rem 0.9rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          color: var(--text-main);
          font-size: 0.95rem;
        }
        .checkout-field input:focus,
        .checkout-field select:focus {
          outline: none;
          border-color: var(--accent-gold);
        }
        .checkout-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }
        .checkout-checkbox {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.88rem;
          color: var(--text-muted);
          cursor: pointer;
        }
        .checkout-checkbox input {
          width: auto;
          accent-color: var(--accent-gold);
        }
        .checkout-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .checkout-option:hover {
          border-color: rgba(212, 175, 55, 0.45);
        }
        .checkout-option.selected {
          border-color: var(--accent-gold);
          background: rgba(212, 175, 55, 0.08);
        }
        .checkout-option-left {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .checkout-option input {
          width: auto;
          margin-top: 0.2rem;
          accent-color: var(--accent-gold);
        }
        .checkout-option-title {
          font-size: 0.92rem;
          font-weight: 500;
          margin-bottom: 0.15rem;
        }
        .checkout-option-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .checkout-option-price {
          font-size: 0.92rem;
          font-weight: 500;
          white-space: nowrap;
        }
        .checkout-sidebar {
          position: sticky;
          top: 1.5rem;
        }
        .checkout-summary {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 1.5rem;
        }
        .checkout-summary-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 320px;
          overflow-y: auto;
          margin-bottom: 1.25rem;
          padding-right: 0.25rem;
        }
        .checkout-summary-item {
          display: flex;
          gap: 0.85rem;
          align-items: center;
        }
        .checkout-summary-thumb {
          position: relative;
          flex-shrink: 0;
        }
        .checkout-summary-thumb img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
        }
        .checkout-summary-qty {
          position: absolute;
          top: -8px;
          right: -8px;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 999px;
          background: var(--accent-gold);
          color: var(--text-dark);
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .checkout-summary-info {
          flex: 1;
          min-width: 0;
        }
        .checkout-summary-info h4 {
          margin: 0 0 0.2rem;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 500;
          line-height: 1.35;
        }
        .checkout-summary-info p {
          margin: 0;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .checkout-summary-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          margin-bottom: 0.55rem;
          color: var(--text-muted);
        }
        .checkout-summary-line.total {
          margin-top: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .checkout-summary-line.total span:last-child {
          color: var(--accent-gold);
        }
        .checkout-submit {
          width: 100%;
          margin-top: 1.25rem;
          padding: 1rem 1.5rem;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .checkout-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }
        .checkout-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 0.85rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .checkout-footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
          font-size: 0.78rem;
        }
        .checkout-footer-links a {
          color: var(--text-muted);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .checkout-footer-links a:hover {
          color: var(--accent-gold);
        }
        .checkout-error {
          padding: 0.85rem 1rem;
          border-radius: 8px;
          background: rgba(255, 107, 107, 0.12);
          border: 1px solid rgba(255, 107, 107, 0.35);
          color: #ff9f9f;
          font-size: 0.88rem;
        }
        @media (max-width: 960px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
          .checkout-sidebar {
            position: static;
          }
          .checkout-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        @media (max-width: 560px) {
          .checkout-row-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="checkout-header">
        <Link to="/" className="checkout-brand">
          JEWELSAFA
        </Link>
        <nav className="checkout-breadcrumb" aria-label="Checkout progress">
          <Link to="/cart">Cart</Link>
          <ChevronRight size={14} />
          <span className="active">Information</span>
          <ChevronRight size={14} />
          <span>Shipping</span>
          <ChevronRight size={14} />
          <span>Payment</span>
        </nav>
      </header>

      <form className="checkout-layout" onSubmit={placeOrderHandler}>
        <div className="checkout-main">
          <section className="checkout-section">
            <div className="checkout-section-head">
              <h2>Contact</h2>
            </div>
            <div className="checkout-field">
              <label htmlFor="checkout-email">Email</label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <label className="checkout-checkbox">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
              />
              Email me with news and offers
            </label>
          </section>

          <section className="checkout-section">
            <div className="checkout-section-head">
              <h2>Delivery</h2>
            </div>
            <div className="checkout-field">
              <label htmlFor="checkout-country">Country / Region</label>
              <select
                id="checkout-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="Pakistan">Pakistan</option>
                <option value="USA">United States</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="UK">United Kingdom</option>
              </select>
            </div>
            <div className="checkout-row-2">
              <div className="checkout-field">
                <label htmlFor="checkout-first">First name</label>
                <input
                  id="checkout-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="checkout-last">Last name</label>
                <input
                  id="checkout-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="checkout-field">
              <label htmlFor="checkout-address">Address</label>
              <input
                id="checkout-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no., street, area"
                required
              />
            </div>
            <div className="checkout-field">
              <label htmlFor="checkout-apartment">
                Apartment, suite, etc. (optional)
              </label>
              <input
                id="checkout-apartment"
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="Apartment, floor, landmark"
              />
            </div>
            <div className="checkout-row-2">
              <div className="checkout-field">
                <label htmlFor="checkout-city">City</label>
                <input
                  id="checkout-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="checkout-province">Province</label>
                <input
                  id="checkout-province"
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Punjab, Sindh, etc."
                />
              </div>
            </div>
            <div className="checkout-row-2">
              <div className="checkout-field">
                <label htmlFor="checkout-postal">Postal code</label>
                <input
                  id="checkout-postal"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="checkout-phone">Phone</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XX XXXXXXX"
                />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 600 }}>
              Shipping method
            </h2>
            <label
              className={`checkout-option ${shippingMethod === 'standard' ? 'selected' : ''}`}
            >
              <div className="checkout-option-left">
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shippingMethod === 'standard'}
                  onChange={() => setShippingMethod('standard')}
                />
                <div>
                  <div className="checkout-option-title">Standard delivery</div>
                  <div className="checkout-option-desc">
                    5–7 business days · Tracked shipping
                  </div>
                </div>
              </div>
              <span className="checkout-option-price">
                {standardShipping === 0 ? 'Free' : `Rs. ${standardShipping.toFixed(2)}`}
              </span>
            </label>
            <label
              className={`checkout-option ${shippingMethod === 'express' ? 'selected' : ''}`}
            >
              <div className="checkout-option-left">
                <input
                  type="radio"
                  name="shipping"
                  value="express"
                  checked={shippingMethod === 'express'}
                  onChange={() => setShippingMethod('express')}
                />
                <div>
                  <div className="checkout-option-title">Express delivery</div>
                  <div className="checkout-option-desc">
                    2–3 business days · Priority handling
                  </div>
                </div>
              </div>
              <span className="checkout-option-price">Rs. {expressShipping.toFixed(2)}</span>
            </label>
          </section>

          <section className="checkout-section">
            <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 600 }}>
              Payment
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              All transactions are secure and encrypted.
            </p>
            <label
              className={`checkout-option ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
            >
              <div className="checkout-option-left">
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                />
                <div>
                  <div className="checkout-option-title">Cash on Delivery (COD)</div>
                  <div className="checkout-option-desc">Pay when your order arrives</div>
                </div>
              </div>
            </label>
            <label
              className={`checkout-option ${paymentMethod === 'Sandbox Credit Card' ? 'selected' : ''}`}
            >
              <div className="checkout-option-left">
                <input
                  type="radio"
                  name="payment"
                  value="Sandbox Credit Card"
                  checked={paymentMethod === 'Sandbox Credit Card'}
                  onChange={() => setPaymentMethod('Sandbox Credit Card')}
                />
                <div>
                  <div className="checkout-option-title">Credit / Debit card</div>
                  <div className="checkout-option-desc">Sandbox test payment</div>
                </div>
              </div>
            </label>
            <label
              className={`checkout-option ${paymentMethod === 'PayPal Sandbox' ? 'selected' : ''}`}
            >
              <div className="checkout-option-left">
                <input
                  type="radio"
                  name="payment"
                  value="PayPal Sandbox"
                  checked={paymentMethod === 'PayPal Sandbox'}
                  onChange={() => setPaymentMethod('PayPal Sandbox')}
                />
                <div>
                  <div className="checkout-option-title">PayPal</div>
                  <div className="checkout-option-desc">Sandbox test payment</div>
                </div>
              </div>
            </label>
          </section>

          {orderError && <div className="checkout-error">{orderError}</div>}

          <div className="checkout-footer-links">
            <Link to="/cart">Return to cart</Link>
            <a href="#">Refund policy</a>
            <a href="#">Shipping policy</a>
            <a href="#">Privacy policy</a>
          </div>
        </div>

        <aside className="checkout-sidebar">
          <div className="checkout-summary">
            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div key={item.product} className="checkout-summary-item">
                  <div className="checkout-summary-thumb">
                    <img src={item.image} alt={item.name} />
                    <span className="checkout-summary-qty">{item.qty}</span>
                  </div>
                  <div className="checkout-summary-info">
                    <h4>{item.name}</h4>
                    <p>{item.material || 'Fine jewelry'}</p>
                  </div>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                    Rs. {(item.qty * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <div className="checkout-summary-line">
                <span>Subtotal · {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                <span>Rs. {itemsPrice.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-line">
                <span>Shipping</span>
                <span>
                  {shippingPrice === 0 ? 'Free' : `Rs. ${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="checkout-summary-line">
                <span>Estimated tax</span>
                <span>Rs. {taxPrice.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-line total">
                <span>Total</span>
                <span>PKR {totalPrice}</span>
              </div>
            </div>

            {orderError && (
              <div className="checkout-error" style={{ marginBottom: '0.75rem' }}>
                {orderError}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary checkout-submit"
              disabled={isProcessing || cartItems.length === 0}
            >
              {isProcessing ? 'Processing…' : 'Complete order'}
            </button>
            <div className="checkout-trust">
              <Lock size={14} />
              Secure checkout
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
