import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState('123 Luxury Lane');
  const [city, setCity] = useState('Beverly Hills');
  const [postalCode, setPostalCode] = useState('90210');
  const [country, setCountry] = useState('USA');
  const [paymentMethod, setPaymentMethod] = useState('Sandbox Credit Card');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = (itemsPrice + taxPrice + shippingPrice).toFixed(2);

  const placeOrderHandler = async () => {
    try {
      setIsProcessing(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const orderData = {
        orderItems: cartItems,
        shippingAddress: { address, city, postalCode, country },
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      await axios.post('/api/orders', orderData, config);
      clearCart();
      setIsProcessing(false);
      navigate('/profile'); // Redirect to profile to track order
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fade-in" style={{ marginTop: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>Secure Checkout</h1>
      
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Shipping Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>Shipping Details</h3>
          <div className="grid" style={{ gap: '1rem' }}>
            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <input type="text" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
            <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
          </div>

          <h3 style={{ margin: '2rem 0 1.5rem 0', fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>Payment Method</h3>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Sandbox Credit Card">Sandbox Credit Card</option>
            <option value="PayPal Sandbox">PayPal Sandbox</option>
          </select>
        </div>

        {/* Order Summary */}
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>Order Specs</h3>
          
          <div style={{ marginBottom: '2rem' }}>
            {cartItems.map((item, index) => (
              <div key={index} className="flex-between" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>{item.qty} x {item.name}</span>
                <span>${(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div className="flex-between text-muted" style={{ marginBottom: '0.5rem' }}><span>Items</span><span>${itemsPrice.toFixed(2)}</span></div>
            <div className="flex-between text-muted" style={{ marginBottom: '0.5rem' }}><span>Shipping</span><span>${shippingPrice.toFixed(2)}</span></div>
            <div className="flex-between text-muted" style={{ marginBottom: '1rem' }}><span>Tax</span><span>${taxPrice}</span></div>
            
            <div className="flex-between text-gold" style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
              <span>Total</span><span>${totalPrice}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }} 
              onClick={placeOrderHandler}
              disabled={cartItems.length === 0 || isProcessing}
            >
              {isProcessing ? 'Processing Transaction...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
