import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, wishlist } = useContext(WishlistContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, 1);
    navigate('/cart');
  };

  const isWishlisted = wishlist.includes(product._id);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading masterpiece...</div>;

  return (
    <div className="fade-in" style={{ marginTop: '2rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
        &larr; GO BACK
      </button>
      
      <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '4rem', alignItems: 'center' }}>
        {/* Image Display */}
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
        </div>

        {/* Product Details */}
        <div>
          <p className="text-gold" style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            {product.brand} | {product.category}
          </p>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{product.name}</h1>
          <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.8' }}>
            {product.description}
          </p>
          
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '1rem 0' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Material</span>
              <p style={{ fontWeight: '500' }}>{product.material}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</span>
              <p style={{ color: product.countInStock > 0 ? '#4caf50' : '#f44336' }}>
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: '400', marginBottom: '2rem', color: 'var(--text-main)' }}>
            ${product.price}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              style={{ flex: 1, opacity: product.countInStock === 0 ? 0.5 : 1 }}
            >
              Add to Cart
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => toggleWishlist(product._id)}
              style={{ borderColor: isWishlisted ? 'var(--accent-gold)' : '', color: isWishlisted ? 'var(--accent-gold)' : '' }}
            >
              ♥ {isWishlisted ? 'Saved' : 'Wishlist'}
            </button>
          </div>

          {/* Render SEO tags if they exist (Demo purposes) */}
          {product.seoTags && product.seoTags.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Keywords: </span>
              {product.seoTags.map((tag, i) => (
                <span key={i} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', marginRight: '5px' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
