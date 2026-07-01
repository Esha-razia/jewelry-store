import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, Heart, User as UserIcon, LogOut, Menu, X, Home, Sparkles, TrendingUp, LayoutGrid, Shield, Gem, ChevronDown, ChevronRight, PackageSearch, Mail, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const closeMenu = () => {
    setMenuOpen(false);
    setCategoriesOpen(false);
  };

  useEffect(() => {
    if (searchOpen && products.length === 0) {
      axios.get('/api/products')
        .then(({ data }) => setProducts(data))
        .catch(err => console.error("Error loading products for search:", err));
    }
  }, [searchOpen, products.length]);

  useEffect(() => {
    if (!searchOpen) {
      if (!menuOpen) document.body.style.overflow = '';
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      if (!menuOpen) document.body.style.overflow = prevOverflow;
    };
  }, [searchOpen, menuOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;
    
    const queryWords = query.split(/\s+/).filter(w => w.length > 0);
    if (queryWords.length === 0) return false;

    const searchableText = [
      p.name,
      p.description,
      p.category,
      p.material,
      ...(p.seoTags || [])
    ].filter(Boolean).join(' ').toLowerCase();

    return queryWords.every(word => searchableText.includes(word));
  });

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = '';
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setCategoriesOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <nav className="glass-panel nav-bar-shell">
        <div className="nav-bar-row">
          {/* Left Side: Hamburger + Logo */}
          <div className="nav-bar-brand">
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
            <Link to="/" className="nav-logo" onClick={closeMenu}>
              <span className="nav-logo-jewel">JEWEL</span>
              <span className="nav-logo-safa">SAFA</span>
            </Link>
          </div>



          {/* Right Icons (Sign in only in hamburger menu) */}
          <div className="nav-bar-actions">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search masterpieces"
              className="nav-icon-btn nav-icon-link"
              style={{ padding: 0 }}
            >
              <Search size={22} className="text-muted hover:text-gold" />
            </button>
            <Link to="/profile?view=wishlist" aria-label="Wishlist" className="nav-icon-link">
              <Heart size={22} className="text-muted hover:text-gold" />
            </Link>
            <Link to="/cart" className="nav-icon-link nav-cart-link" aria-label="Shopping bag">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="nav-cart-badge">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            {user && (
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <Link to={user.isAdmin ? '/admin' : '/profile'} aria-label="Account" className="nav-icon-link">
                  <UserIcon size={22} className="text-gold" />
                </Link>
                <button type="button" onClick={logout} aria-label="Sign out" className="nav-icon-btn">
                  <LogOut size={22} />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Slide-out Hamburger Menu */}
      <div
        className={`hamburger-overlay${menuOpen ? ' is-open' : ''}`}
        onClick={closeMenu}
        role="presentation"
        aria-hidden={!menuOpen}
      />

      <div
        className={`hamburger-menu${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Menu Header */}
        <div style={{
          padding: '2rem 1.5rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gem size={22} style={{ color: 'var(--accent-gold)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: '600' }}>JEWEL</span>
            <span style={{ color: 'var(--accent-gold)', fontSize: '1.2rem' }}>SAFA</span>
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
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '600' }}>Navigate</p>

          <Link to="/" onClick={closeMenu} style={menuItemStyle}>
            <Home size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>Home</span>
          </Link>

          <Link to="/cart" onClick={closeMenu} style={menuItemStyle}>
            <ShoppingBag size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>Shopping bag {cartCount > 0 ? `(${cartCount})` : ''}</span>
          </Link>

          {/* Collapsible Shop Categories */}
          <div>
            <div 
              onClick={() => setCategoriesOpen(!categoriesOpen)} 
              style={{ ...menuItemStyle, justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <LayoutGrid size={20} style={{ color: 'var(--accent-gold)' }} />
                <span>Shop Categories</span>
              </div>
              {categoriesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {categoriesOpen && (
              <div style={{ paddingLeft: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem', animation: 'fadeIn 0.2s ease-out' }}>
                <Link to="/category/rings" onClick={closeMenu} style={categoryLinkStyle}>Rings</Link>
                <Link to="/category/necklaces" onClick={closeMenu} style={categoryLinkStyle}>Necklaces</Link>
                <Link to="/category/bracelets" onClick={closeMenu} style={categoryLinkStyle}>Bracelets</Link>
                <Link to="/category/earrings" onClick={closeMenu} style={categoryLinkStyle}>Earrings</Link>
                <Link to="/category/bangles" onClick={closeMenu} style={categoryLinkStyle}>Bangles</Link>
              </div>
            )}
          </div>

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

          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '600' }}>Help</p>

          <Link to="/track-order" onClick={closeMenu} style={menuItemStyle}>
            <PackageSearch size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>Track order</span>
          </Link>

          <Link to="/contact" onClick={closeMenu} style={menuItemStyle}>
            <Mail size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>Contact us</span>
          </Link>

          {/* Separator */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />

          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '600' }}>Account</p>

          {user ? (
            <>
              <Link to="/profile" onClick={closeMenu} style={menuItemStyle}>
                <UserIcon size={20} style={{ color: 'var(--accent-gold)' }} />
                <span>My Profile</span>
              </Link>

              <Link to="/profile?view=wishlist" onClick={closeMenu} style={menuItemStyle}>
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

      {/* Search Overlay Modal */}
      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search masterpieces">
          <div className="search-modal-backdrop" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} />
          <div className="search-container glass-panel fade-in">
            <div className="search-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gem size={20} style={{ color: 'var(--accent-gold)' }} />
                <span className="search-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', letterSpacing: '0.05em' }}>Search Our Collection</span>
              </div>
              <button 
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="search-close-btn"
                aria-label="Close search"
              >
                <X size={22} />
              </button>
            </div>
            
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Type to search rings, necklaces, diamonds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input"
              />
              <Search className="search-input-icon" size={20} />
            </div>

            <div className="search-results-container">
              {searchQuery.trim() === '' ? (
                <div className="search-placeholder">
                  <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>Discover our range of handcrafted jewelry masterpieces</p>
                  <div className="search-suggestions">
                    <span className="search-tag" onClick={() => setSearchQuery('Ring')}>Rings</span>
                    <span className="search-tag" onClick={() => setSearchQuery('Gold')}>Gold</span>
                    <span className="search-tag" onClick={() => setSearchQuery('Diamond')}>Diamond</span>
                    <span className="search-tag" onClick={() => setSearchQuery('Necklace')}>Necklaces</span>
                    <span className="search-tag" onClick={() => setSearchQuery('Bracelet')}>Bracelets</span>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="search-results-grid">
                  {filteredProducts.map(p => (
                    <Link
                      key={p._id}
                      to={`/product/${p.slug || p._id}`}
                      state={{ productId: p._id }}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="search-result-card"
                    >
                      <img src={p.image} alt={p.name} className="search-result-img" />
                      <div className="search-result-info">
                        <span className="search-result-name">{p.name}</span>
                        <span className="search-result-meta">{p.material} | {p.category}</span>
                        <span className="search-result-price">Rs. {p.price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="search-no-results">
                  <p className="text-muted">No masterpieces found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

const categoryLinkStyle = {
  display: 'block',
  textDecoration: 'none',
  color: 'var(--text-muted)',
  fontSize: '0.85rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  marginBottom: '0.2rem',
};

export default Navbar;
