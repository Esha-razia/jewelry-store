import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, Heart, User as UserIcon, LogOut, Menu, X, Home, Sparkles, TrendingUp, LayoutGrid, Shield, Gem } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="glass-panel" style={{ margin: '1rem', padding: '1rem 2rem', borderRadius: '50px', position: 'relative', zIndex: 1000 }}>
        <div className="flex-between">
          {/* Left Side: Hamburger + Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Hamburger Icon */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: '12px',
                transition: 'all 0.3s ease',
                backgroundColor: menuOpen ? 'rgba(212,175,55,0.15)' : 'transparent',
              }}
              aria-label="Open navigation menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }} onClick={closeMenu}>
              <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', fontWeight: '600' }}>AURORA</span>
              <span style={{ marginLeft: '5px', color: 'var(--accent-gold)' }}>JEWELS</span>
            </Link>
          </div>



          {/* Right Icons */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/profile"><Heart size={22} className="text-muted hover:text-gold" /></Link>
            
            <Link to="/cart" style={{ position: 'relative' }}>
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px', 
                  backgroundColor: 'var(--accent-gold)', color: '#000',
                  borderRadius: '50%', padding: '0 6px', fontSize: '10px', fontWeight: 'bold'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link to={user.isAdmin ? '/admin' : '/profile'}>
                  <UserIcon size={22} className="text-gold" />
                </Link>
                <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>SIGN IN</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Slide-out Hamburger Menu */}
      {menuOpen && (
        <div
          className="hamburger-overlay"
          onClick={closeMenu}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            zIndex: 1001, animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      <div
        className="hamburger-menu"
        style={{
          position: 'fixed', top: 0, left: menuOpen ? '0' : '-320px',
          width: '300px', height: '100vh', zIndex: 1002,
          background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
          borderRight: '1px solid rgba(212,175,55,0.15)',
          boxShadow: menuOpen ? '4px 0 30px rgba(0,0,0,0.5)' : 'none',
          transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
        }}
      >
        {/* Menu Header */}
        <div style={{
          padding: '2rem 1.5rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gem size={22} style={{ color: 'var(--accent-gold)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: '600' }}>AURORA</span>
            <span style={{ color: 'var(--accent-gold)', fontSize: '1.2rem' }}>JEWELS</span>
          </div>
          <button
            onClick={closeMenu}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Section: Main */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '600' }}>Navigate</p>

          <Link to="/" onClick={closeMenu} style={menuItemStyle}>
            <Home size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>Home</span>
          </Link>

          <a href="/#collection" onClick={closeMenu} style={menuItemStyle}>
            <LayoutGrid size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>Collections</span>
          </a>

          <a href="/#collection" onClick={closeMenu} style={menuItemStyle}>
            <Sparkles size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>New Arrivals</span>
          </a>

          <a href="/#trending" onClick={closeMenu} style={menuItemStyle}>
            <TrendingUp size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>Trending</span>
          </a>

          {/* Separator */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />

          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '600' }}>Account</p>

          {user ? (
            <>
              <Link to="/profile" onClick={closeMenu} style={menuItemStyle}>
                <UserIcon size={20} style={{ color: 'var(--accent-gold)' }} />
                <span>My Profile</span>
              </Link>

              <Link to="/cart" onClick={closeMenu} style={menuItemStyle}>
                <ShoppingBag size={20} style={{ color: 'var(--accent-gold)' }} />
                <span>Shopping Bag {cartCount > 0 ? `(${cartCount})` : ''}</span>
              </Link>

              <Link to="/profile" onClick={closeMenu} style={menuItemStyle}>
                <Heart size={20} style={{ color: 'var(--accent-gold)' }} />
                <span>Wishlist</span>
              </Link>

              {user.isAdmin && (
                <>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '600' }}>Administration</p>
                  <Link to="/admin" onClick={closeMenu} style={menuItemStyle}>
                    <Shield size={20} style={{ color: 'var(--accent-gold)' }} />
                    <span>Admin Dashboard</span>
                  </Link>
                </>
              )}
            </>
          ) : (
            <Link to="/auth" onClick={closeMenu} style={menuItemStyle}>
              <UserIcon size={20} style={{ color: 'var(--accent-gold)' }} />
              <span>Sign In / Register</span>
            </Link>
          )}
        </div>

        {/* Menu Footer */}
        {user && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => { logout(); closeMenu(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.8rem 1rem', borderRadius: '12px',
                background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
                color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Reusable style for menu items
const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: '0.8rem',
  padding: '0.8rem 1rem', borderRadius: '12px',
  textDecoration: 'none', color: 'var(--text-main)',
  fontSize: '0.95rem', fontWeight: '400',
  transition: 'all 0.2s ease', marginBottom: '0.3rem',
  cursor: 'pointer',
};

export default Navbar;
