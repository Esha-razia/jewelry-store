import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { wishlist } = useContext(WishlistContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/orders/myorders', config);
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) return <h2 style={{ textAlign: 'center', marginTop: '4rem' }}>Please log in.</h2>;

  return (
    <div className="fade-in" style={{ marginTop: '2rem' }}>
      <h1 style={{ marginBottom: '3rem' }}>Welcome, {user.name}</h1>
      
      <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 2fr)', gap: '4rem' }}>
        
        {/* User Details & Wishlist */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>Account Details</h3>
            <p className="text-muted"><strong>Name:</strong> {user.name}</p>
            <p className="text-muted"><strong>Email:</strong> {user.email}</p>
            {user.isAdmin && (
              <div style={{ marginTop: '1.5rem' }}>
                <span style={{ display: 'inline-block', marginBottom: '1rem', background: 'var(--accent-gold)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Administrator</span>
                <Link to="/admin" className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', display: 'block', textAlign: 'center' }}>
                   Go to Admin Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>My Wishlist</h3>
            {wishlist.length === 0 ? (
              <p className="text-muted">Wishlist is empty.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {wishlist.map((id, index) => (
                  <Link key={index} to={`/product/${id}`} className="text-gold" style={{ fontSize: '0.9rem' }}>
                    View Wishlist Item &rarr;
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Tracking */}
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Order History & Tracking</h2>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted">You have no orders yet.</p>
          ) : (
            <div className="grid" style={{ gap: '1.5rem' }}>
              {orders.map((order) => (
                <div key={order._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Order #{order.orderNumber || order._id}
                    </span>
                    <span style={{ color: order.isDelivered ? '#4caf50' : 'var(--accent-gold)' }}>
                      {order.isDelivered ? 'Delivered' : 'Processing'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {order.orderItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.9rem' }}>{item.name} (x{item.qty})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-between text-muted" style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                    <span>Total: ${order.totalPrice}</span>
                    <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
