import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const CategoryProducts = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

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
      {/* Top Header with Back button */}
      <div className="category-header">
        <button 
          onClick={() => navigate(-1)} 
          className="category-header-back"
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        
        <h2 className="category-header-title">
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
          {/* Category Filter Bar */}
          <div className="glass-panel category-filter-bar" style={{ padding: '1.25rem 2rem', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', flex: '1 1 auto' }}>
              
              {/* Category Search Input */}
              <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '220px', flex: '1 1 auto', maxWidth: '320px' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Search {categoryTitle}</span>
                <input 
                  type="text"
                  placeholder="Type to filter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Sort Filter */}
              <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '160px' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sort By</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name: A to Z</option>
                  <option value="name-z-a">Name: Z to A</option>
                </select>
              </div>

              {/* In Stock Only Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1.25rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  id="stock-filter"
                  checked={inStockOnly} 
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
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
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '8px', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)' }}
              >
                Reset
              </button>
            )}
          </div>

          {filteredAndSortedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', margin: '4rem 0' }} className="fade-in">
              <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                No masterpieces match the selected filters.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline">Clear Filters</button>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              {filteredAndSortedProducts.map((product) => (
                <Link 
                  to={`/product/${product.slug || product._id}`} 
                  state={{ productId: product._id }}
                  key={product._id} 
                  className="glass-panel" 
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease' }} 
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} 
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ height: '200px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>{product.name}</h3>
                      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{product.material}</p>
                    </div>
                    <div style={{ fontWeight: '500', fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
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
