import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const OrderViewer = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/orders', config);
      setOrders(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const deliverHandler = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/orders/${id}/deliver`, {}, config);
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const payHandler = async (id) => {
    if (window.confirm('Mark this order as paid manually?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`/api/orders/${id}/pay`, {}, config);
        fetchOrders();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '2rem' }}>Store Orders</h2>
      
      {loading ? ( <p>Loading orders...</p> ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} style={{ fontSize: '0.85rem' }}>
                <td className="text-muted">{order.orderNumber || order._id.substring(18)}</td>
                <td>{order.user?.name || 'Guest'}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>Rs. {order.totalPrice}</td>
                <td>
                   <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-danger'}`}>
                     {order.isPaid ? 'Paid' : 'Pending'}
                   </span>
                </td>
                <td>
                   <span className={`badge ${order.isDelivered ? 'badge-success' : 'badge-warning'}`}>
                     {order.isDelivered ? 'Delivered' : 'Processing'}
                   </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!order.isPaid && (
                      <button onClick={() => payHandler(order._id)} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Mark Paid</button>
                    )}
                    {!order.isDelivered && (
                      <button onClick={() => deliverHandler(order._id)} className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Mark Delivered</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderViewer;
