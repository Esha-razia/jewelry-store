import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import ProductManager from './ProductManager';
import OrderViewer from './OrderViewer';
import UserManager from './UserManager';
import DashboardOverview from './DashboardOverview';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || !user.isAdmin) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}><h3 className="fade-in">Access Denied. Admins Only.</h3></div>;
  }

  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <div className="fade-in" style={{ marginTop: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: 0 }}>Admin Portal</h1>
        <div style={{ fontSize: '0.9rem' }} className="text-muted">Logged in as: <span className="text-gold">{user.name}</span></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(250px, 1fr) minmax(300px, 4fr)', gap: '2rem' }}>
        
        {/* Sidebar Nav */}
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem', fontSize: '1.2rem' }}>Workspace</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <Link 
                to="/admin" 
                className={`btn btn-outline ${isActive('/admin') && !isActive('/admin/overview') && !isActive('/admin/orders') && !isActive('/admin/users') ? 'active-link' : ''}`}
                style={{ width: '100%', textAlign: 'left', border: 'none', background: isActive('/admin') && location.pathname === '/admin' ? 'rgba(212,175,55,0.1)' : 'transparent', color: isActive('/admin') && location.pathname === '/admin' ? 'var(--accent-gold)' : 'var(--text-main)' }}
              >
                Products & SEO
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/overview" 
                className="btn btn-outline"
                style={{ width: '100%', textAlign: 'left', border: 'none', background: isActive('/admin/overview') ? 'rgba(212,175,55,0.1)' : 'transparent', color: isActive('/admin/overview') ? 'var(--accent-gold)' : 'var(--text-main)' }}
              >
                AI Analytics & Inventory
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/orders" 
                className="btn btn-outline"
                style={{ width: '100%', textAlign: 'left', border: 'none', background: isActive('/admin/orders') ? 'rgba(212,175,55,0.1)' : 'transparent', color: isActive('/admin/orders') ? 'var(--accent-gold)' : 'var(--text-main)' }}
              >
                Order History
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className="btn btn-outline"
                style={{ width: '100%', textAlign: 'left', border: 'none', background: isActive('/admin/users') ? 'rgba(212,175,55,0.1)' : 'transparent', color: isActive('/admin/users') ? 'var(--accent-gold)' : 'var(--text-main)' }}
              >
                User Accounts
              </Link>
            </li>
            
            <li style={{ marginTop: '3rem' }}>
              <button className="btn btn-outline" style={{width: '100%', fontSize: '0.8rem', borderColor: 'rgba(255,255,255,0.1)'}} onClick={() => navigate('/profile')}>
                Exit to Profile
              </button>
            </li>
          </ul>
        </div>

        {/* Dynamic Content */}
        <div className="glass-panel admin-content-panel" style={{ padding: '3rem', minHeight: '600px' }}>
           <Routes>
              <Route path="/" element={<ProductManager />} />
              <Route path="overview" element={<DashboardOverview />} />
              <Route path="orders" element={<OrderViewer />} />
              <Route path="users" element={<UserManager />} />
           </Routes>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
