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

          {/* Togglable Filter Radio Menu (Matching User Screenshot) */}
          {filtersOpen && (
            <div className="filter-radio-menu fade-in">
              {[
                { label: 'Price: Low to High', value: 'price-low-high' },
                { label: 'Price: High to Low', value: 'price-high-low' },
                { label: 'Name: A to Z', value: 'name-a-z' },
                { label: 'Name: Z to A', value: 'name-z-a' }
              ].map((opt) => (
                <div 
                  key={opt.value} 
                  className={`filter-radio-item ${sortBy === opt.value ? 'selected' : ''}`}
                  onClick={() => setSortBy(sortBy === opt.value ? 'featured' : opt.value)}
                >
                  <span>{opt.label}</span>
                  <div className={`radio-circle ${sortBy === opt.value ? 'active' : ''}`} />
                </div>
              ))}
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
                  className="product-card-link glass-panel"
                >
                  <div className="product-card-image-wrapper">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-card-info-wrapper">
                    <div className="product-card-meta">
                      <h3>{product.name}</h3>
                      <p className="product-card-material">{product.material}</p>
                      {colsCount === 1 && (
                        <p className="product-card-desc">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="product-card-price">
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
