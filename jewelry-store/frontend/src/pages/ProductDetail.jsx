import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, wishlist } = useContext(WishlistContext);
  
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Generate dynamic FAQs as fallback if product faqs are missing
  const getDynamicFAQs = () => {
    const name = product.name || 'this jewelry masterpiece';
    const material = product.material || 'precious metals';
    const category = (product.category || 'Jewelry').toLowerCase().replace(/s$/, '');

    return [
      {
        question: `Is this ${name} crafted from authentic materials?`,
        answer: `Yes, absolutely. The ${name} is meticulously handcrafted using genuine, certified ${material}. Each piece undergoes strict quality inspections and is hallmarked for metal purity.`
      },
      {
        question: `How should I clean and maintain my ${material} ${category}?`,
        answer: `To preserve the luster of your ${category}, we recommend cleaning it gently with a soft lint-free jewelry cloth. Avoid exposing the ${material} to harsh chemicals, perfumes, chlorine, or direct contact with water for extended periods.`
      },
      {
        question: `What are the shipping details and returns for this product?`,
        answer: `We provide free, 100% insured, secure delivery across the country for all our items. The ${name} comes with a 14-day hassle-free return policy, provided it remains in its original unworn condition with all security tags intact.`
      },
      {
        question: `Does the ${name} come with a certificate of authenticity?`,
        answer: `Yes, every purchase from JEWELSAFA includes an official, hand-signed Certificate of Authenticity detailing the exact specifications of the ${material} and craftsmanship used.`
      }
    ];
  };

  const faqsToRender = product.faqs && product.faqs.length > 0 ? product.faqs : getDynamicFAQs();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const identifier = location.state?.productId || slug;
        const { data } = await axios.get(`/api/products/${identifier}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || err.message || "Failed to load product");
        setLoading(false);
      }
    };
    if (slug) {
      fetchProduct();
    }
  }, [slug, location.state?.productId]);

  const handleAddToCart = () => {
    addToCart(product, 1);
    navigate('/cart');
  };

  const isWishlisted = product && product._id ? wishlist.includes(product._id) : false;

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading masterpiece...</div>;

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }} className="fade-in">
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>Masterpiece Not Found</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ marginTop: '2rem' }}>
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
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '1rem' }}>{product.name}</h1>
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
            Rs. {product.price}
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

      {/* Product FAQs Section */}
      <div className="product-faq-section glass-panel" style={{ marginTop: '4rem', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '2.5rem', fontFamily: 'var(--font-serif)' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqsToRender.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                className="faq-item" 
                style={{ 
                  borderBottom: '1px solid var(--border-subtle)', 
                  paddingBottom: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.05rem',
                    fontWeight: '500',
                  }}
                >
                  <span style={{ color: isOpen ? 'var(--accent-gold)' : 'var(--text-main)', transition: 'color 0.2s ease' }}>
                    {faq.question}
                  </span>
                  <span style={{ color: 'var(--accent-gold)' }}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>
                
                <div
                  style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p className="text-muted" style={{ padding: '0.5rem 0 1rem 0', fontSize: '0.95rem', lineHeight: '1.7' }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
