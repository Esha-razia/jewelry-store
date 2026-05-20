import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const CategoryProducts = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {products.map((product) => (
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
    </div>
  );
};

export default CategoryProducts;
