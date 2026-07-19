import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Sliders } from 'lucide-react';

const CategoryProducts = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [colsCount, setColsCount] = useState(2); // Default grid layout (2 columns)

  useEffect(() => {
    // Reset filters when category changes
    setSortBy('featured');
    setSearchTerm('');
    setInStockOnly(false);
  }, [name]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/products');
        // Filter by category name (case-insensitive and support both singular/plural or exact match)
        const singular = (s) => s.toLowerCase().replace(/s$/, '');
        const filtered = data.filter(p => singular(p.category || '') === singular(name || ''));
        
        setProducts(filtered);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching category products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [name]);

  // Capitalize category name for header
  const categoryTitle = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  // Apply filtering and sorting
  const filteredAndSortedProducts = products
    .filter(p => {
      // Search term filter (within this category)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const queryWords = query.split(/\s+/).filter(w => w.length > 0);
        if (queryWords.length > 0) {
          const searchableText = [
            p.name,
            p.description,
            p.material,
            p.brand,
            ...(p.seoTags || [])
          ].filter(Boolean).join(' ').toLowerCase();

          const matches = queryWords.every(word => searchableText.includes(word));
          if (!matches) return false;
        }
      }
      // Stock filter
      if (inStockOnly && p.countInStock <= 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low-high') return a.price - b.price;
      if (sortBy === 'price-high-low') return b.price - a.price;
      if (sortBy === 'name-a-z') return a.name.localeCompare(b.name);
      if (sortBy === 'name-z-a') return b.name.localeCompare(a.name);
      return 0; // Featured/Default
    });

  const isFilterActive = sortBy !== 'featured' || searchTerm !== '' || inStockOnly;

  const handleResetFilters = () => {
    setSortBy('featured');
    setSearchTerm('');
    setInStockOnly(false);
  };

  return (
    <div className="fade-in">
      {/* Top Header */}
      <div className="category-header" style={{ justifyContent: 'center', textAlign: 'center', margin: '2rem 0 3rem 0' }}>
        <h2 className="category-header-title" style={{ width: '100%', margin: '0' }}>
          {categoryTitle} Collection
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>Loading Collection...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            No products found in the "{categoryTitle}" category.
          </p>
          <Link to="/" className="btn btn-outline">Go to Shop</Link>
        </div>
      ) : (
        <>
          {/* Layout Controls Bar (Matching User Design) */}
          <div className="layout-controls-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1.5rem 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
            {/* Grid Switchers (Left Side) */}
            <div className="grid-switchers" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <button 
                onClick={() => setColsCount(1)}
                className={`grid-switch-btn ${colsCount === 1 ? 'active' : ''}`}
                style={{ padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: colsCount === 1 ? 'var(--accent-gold)' : 'var(--text-muted)', transition: 'color 0.3s' }}
                aria-label="1 Column Grid"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
              </button>
              <button 
                onClick={() => setColsCount(2)}
                className={`grid-switch-btn ${colsCount === 2 ? 'active' : ''}`}
                style={{ padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: colsCount === 2 ? 'var(--accent-gold)' : 'var(--text-muted)', transition: 'color 0.3s' }}
                aria-label="2 Columns Grid"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="8" height="18" rx="1" />
                  <rect x="13" y="3" width="8" height="18" rx="1" />
                </svg>
              </button>

            </div>

            {/* Filters Toggle Button (Right Side) */}
            <button 
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`filters-toggle-btn ${filtersOpen ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                color: filtersOpen ? 'var(--accent-gold)' : 'var(--text-main)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: '600',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              FILTERS
              <Sliders size={14} style={{ transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
            </button>
          </div>

          {/* Togglable Filter Drawer */}
          {filtersOpen && (
            <div className="glass-panel category-filter-bar fade-in" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', flex: '1 1 auto' }}>
                
                {/* Category Search Input */}
                <input 
                  type="text"
                  placeholder={`Search ${categoryTitle}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', minWidth: '200px', flex: '1 1 auto', maxWidth: '300px' }}
                />

                {/* Sort Filter */}
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '0.6rem 1.8rem 0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', background: '#141414', color: '#fff', border: '1px solid var(--border-subtle)' }}
                >
                  <option value="featured">Featured Sort</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name: A to Z</option>
                  <option value="name-z-a">Name: Z to A</option>
                </select>

                {/* In Stock Only Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    id="stock-filter"
                    checked={inStockOnly} 
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
                  />
                  <label htmlFor="stock-filter" style={{ fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer', userSelect: 'none' }}>
                    In Stock Only
                  </label>
                </div>

              </div>

              {/* Reset Filters button */}
              {isFilterActive && (
                <button 
                  onClick={handleResetFilters}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '8px', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)' }}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {filteredAndSortedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', margin: '4rem 0' }} className="fade-in">
              <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                No masterpieces match the selected filters.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline">Clear Filters</button>
            </div>
          ) : (
            <div className={`product-grid-layout cols-${colsCount}`} style={{ gap: '2rem' }}>
              {filteredAndSortedProducts.map((product) => (
                <Link 
                  to={`/product/${product.slug || product._id}`} 
                  state={{ productId: product._id }}
                  key={product._id} 
                  className="glass-panel" 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit', 
                    display: 'flex', 
                    flexDirection: colsCount === 1 ? 'row' : 'column', 
                    alignItems: colsCount === 1 ? 'center' : 'stretch',
                    transition: 'transform 0.3s ease',
                    overflow: 'hidden'
                  }} 
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} 
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    height: colsCount === 1 ? '360px' : '200px', 
                    width: colsCount === 1 ? '400px' : '100%', 
                    flexShrink: 0,
                    overflow: 'hidden' 
                  }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: colsCount === 1 ? '100%' : 'auto' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>{product.name}</h3>
                      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>{product.material}</p>
                      {colsCount === 1 && (
                        <p className="text-muted" style={{ fontSize: '0.9rem', margin: '0.75rem 0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div style={{ fontWeight: '500', fontSize: '1.1rem', color: 'var(--accent-gold)', marginTop: colsCount === 1 ? '1rem' : '0' }}>
                      Rs. {product.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryProducts;
