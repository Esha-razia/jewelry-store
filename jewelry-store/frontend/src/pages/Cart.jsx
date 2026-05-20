import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="fade-in cart-page" style={{ marginTop: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Your Shopping Bag</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Your bag is currently empty.</p>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-page-grid">
          {/* Cart Items List — first on mobile so bag reads top-to-bottom */}
          <div className="cart-page-items">
            {cartItems.map((item) => (
              <div key={item.product} className="flex-between glass-panel cart-line" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 0, flex: 1 }}>
                  <img src={item.image} alt={item.name} className="cart-line-img" />
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: '500' }}>
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </h4>
                    <p className="text-gold" style={{ margin: 0 }}>${item.price}</p>
                  </div>
                </div>
                
                <div className="cart-line-actions">
                  <select 
                    value={item.qty} 
                    onChange={(e) => addToCart(item, Number(e.target.value))}
                    className="cart-qty-select"
                    aria-label={`Quantity for ${item.name}`}
                  >
                    {[...Array(Math.min(item.countInStock, 10)).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>
                  
                  <button type="button" onClick={() => removeFromCart(item.product)} className="cart-remove-btn" aria-label={`Remove ${item.name}`}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary — below items on mobile (Shopify-style) */}
          <div className="glass-panel cart-page-summary" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>Order Summary</h3>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
              <span>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
            </div>
            <div className="flex-between text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
              <span>Shipping & Taxes calculated at checkout</span>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={handleCheckout}
            >
              Proceed to secure checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
