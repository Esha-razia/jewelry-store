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
    <div className="fade-in" style={{ marginTop: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Your Shopping Bag</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Your bag is currently empty.</p>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          {/* Cart Items List */}
          <div>
            {cartItems.map((item) => (
              <div key={item.product} className="flex-between glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: '500' }}>
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </h4>
                    <p className="text-gold" style={{ margin: 0 }}>${item.price}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select 
                    value={item.qty} 
                    onChange={(e) => addToCart(item, Number(e.target.value))}
                    style={{ width: '70px', padding: '0.5rem' }}
                  >
                    {[...Array(Math.min(item.countInStock, 10)).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>
                  
                  <button onClick={() => removeFromCart(item.product)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
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
