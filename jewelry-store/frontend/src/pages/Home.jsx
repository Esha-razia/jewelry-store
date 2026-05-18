import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, recRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/chat/recommendations')
        ]);
        setProducts(prodRes.data);
        setRecommendations(recRes.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', margin: '4rem 0 6rem 0' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', background: 'linear-gradient(45deg, #FFD700, #F3E5AB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Discover True Elegance
        </h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Curated pieces that highlight your natural beauty and define moments of a lifetime.
        </p>
        <a href="#collection" className="btn btn-primary">Shop The Collection</a>
      </section>

      {/* Product Grid */}
      <h2 id="collection" style={{ textAlign: 'center', marginBottom: '3rem' }}>Latest Arrivals</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading Collection...</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {products.map((product) => (
            <Link to={`/product/${product._id}`} key={product._id} className="glass-panel" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ height: '200px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>{product.name}</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{product.material}</p>
                </div>
                <div style={{ fontWeight: '500', fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                  ${product.price}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Recommended / Trending Section */}
      {!loading && recommendations.length > 0 && (
         <div id="trending" style={{ marginTop: '6rem' }}>
           <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Trending & Hand-Picked For You</h2>
           <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
             {recommendations.map(prod => (
                <Link to={`/product/${prod._id}`} key={`rec_${prod._id}`} className="glass-panel" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ height: '200px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                    <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>{prod.name}</h3>
                      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{prod.material || 'Premium Material'}</p>
                    </div>
                    <div style={{ fontWeight: '500', fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                      ${prod.price}
                    </div>
                  </div>
                </Link>
             ))}
           </div>
         </div>
      )}
    </div>
  );
};

export default Home;
