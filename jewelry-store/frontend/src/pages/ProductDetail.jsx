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
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '2rem' }}>{product.name}</h1>
          
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

          {/* Description + FAQs as accordion dropdowns below Add to Cart */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
            {/* Description accordion */}
            <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 'desc' ? null : 'desc')}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1.1rem 0', cursor: 'pointer', color: 'var(--text-main)',
                  fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: '600',
                  letterSpacing: '0.02em'
                }}
              >
                <span style={{ color: openFaqIndex === 'desc' ? 'var(--accent-gold)' : 'var(--text-main)', transition: 'color 0.2s' }}>
                  Description
                </span>
                <span style={{ color: 'var(--accent-gold)', fontSize: '1.3rem', lineHeight: 1, fontWeight: '300' }}>
                  {openFaqIndex === 'desc' ? '−' : '+'}
                </span>
              </button>
              <div style={{
                maxHeight: openFaqIndex === 'desc' ? '400px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: openFaqIndex === 'desc' ? 1 : 0
              }}>
                <p className="text-muted" style={{ padding: '0.25rem 0 1.25rem 0', fontSize: '0.95rem', lineHeight: '1.75' }}>
                  {product.description}
                </p>
              </div>
            </div>

            {/* FAQs accordion items */}
            {faqsToRender.map((faq, index) => {
              const key = `faq-${index}`;
              const isOpen = openFaqIndex === key;
              return (
                <div key={key} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : key)}
                    style={{
                      width: '100%', background: 'none', border: 'none',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1.1rem 0', cursor: 'pointer', color: 'var(--text-main)',
                      fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: '600',
                      textAlign: 'left', letterSpacing: '0.02em'
                    }}
                  >
                    <span style={{ color: isOpen ? 'var(--accent-gold)' : 'var(--text-main)', transition: 'color 0.2s', paddingRight: '1rem' }}>
                      {faq.question}
                    </span>
                    <span style={{ color: 'var(--accent-gold)', fontSize: '1.3rem', lineHeight: 1, fontWeight: '300', flexShrink: 0 }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: isOpen ? 1 : 0
                  }}>
                    <p className="text-muted" style={{ padding: '0.25rem 0 1.25rem 0', fontSize: '0.95rem', lineHeight: '1.75' }}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

