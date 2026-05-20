import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { label: 'Rings', slug: 'rings', fallback: '/images/rings_1.jpg' },
  { label: 'Necklaces', slug: 'necklaces', fallback: '/images/necklaces_1.jpg' },
  { label: 'Earrings', slug: 'earrings', fallback: '/images/earrings_1.jpg' },
  { label: 'Bracelets', slug: 'bracelets', fallback: '/images/bracelets_1.jpg' },
  { label: 'Bangles', slug: 'bangles', fallback: '/images/bangles_1.jpg' },
];

const ProductCard = ({ product }) => (
  <Link to={`/product/${product._id}`} className="home-product-card">
    <div className="home-product-media">
      <img src={product.image} alt={product.name} loading="lazy" />
      <span className="home-product-quick">Quick view</span>
    </div>
    <div className="home-product-body">
      <h3>{product.name}</h3>
      <p className="home-product-material">{product.material || 'Fine jewelry'}</p>
      <p className="home-product-price">${product.price}</p>
    </div>
  </Link>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, recRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/chat/recommendations'),
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

  const getCategoryImage = (slug, fallback) => {
    const match = products.find(
      (p) => (p.category || '').toLowerCase().replace(/s$/, '') === slug.replace(/s$/, '')
    );
    return match?.image || fallback;
  };

  const bestSellers = useMemo(() => {
    if (!products.length) return [];
    return [...products].sort((a, b) => b.price - a.price).slice(0, 4);
  }, [products]);

  return (
    <div className="home-page fade-in">
      <style>{`
        .home-page {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          margin-top: -2rem;
        }
        .home-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 5%;
        }
        .home-announce {
          background: linear-gradient(90deg, #1a1a1a, #2a2418, #1a1a1a);
          border-bottom: 1px solid var(--border-subtle);
          overflow: hidden;
          padding: 0.65rem 0;
        }
        .home-announce-track {
          display: flex;
          width: max-content;
          animation: homeMarquee 28s linear infinite;
          gap: 3rem;
        }
        .home-announce-track span {
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent-gold-hover);
          white-space: nowrap;
        }
        @keyframes homeMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .home-mega-hero {
          position: relative;
          margin: 1.25rem 0 2.5rem;
          min-height: clamp(340px, 52vw, 520px);
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background-color: #0a0a0a;
        }
        .home-mega-hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .home-mega-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.35) 0%,
            rgba(0, 0, 0, 0.55) 45%,
            rgba(0, 0, 0, 0.72) 100%
          );
        }
        .home-mega-hero-content {
          position: relative;
          z-index: 2;
          padding: 2.5rem 1.5rem;
          max-width: 900px;
        }
        .home-mega-brand {
          margin: 0 0 0.75rem;
          font-family: var(--font-serif);
          font-size: clamp(2rem, 5.5vw, 3.75rem);
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
        }
        .home-mega-caption {
          margin: 0 auto 1.75rem;
          max-width: 520px;
          font-size: clamp(0.95rem, 2vw, 1.15rem);
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.92);
        }
        .home-mega-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .home-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }
        .home-section-head h2 {
          margin: 0;
          font-family: var(--font-sans);
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .home-section-head a {
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent-gold);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .home-categories {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
          margin-bottom: 3.5rem;
        }
        .home-category-card {
          text-decoration: none;
          color: inherit;
          text-align: center;
        }
        .home-category-media {
          aspect-ratio: 3/4;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.75rem;
          background: rgba(255,255,255,0.04);
        }
        .home-category-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .home-category-card:hover .home-category-media img {
          transform: scale(1.05);
        }
        .home-category-card span {
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .home-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        .home-product-card {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }
        .home-product-media {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 4px;
          overflow: hidden;
          background: rgba(255,255,255,0.04);
          margin-bottom: 0.85rem;
        }
        .home-product-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .home-product-card:hover .home-product-media img {
          transform: scale(1.04);
        }
        .home-product-quick {
          position: absolute;
          left: 50%;
          bottom: 1rem;
          transform: translateX(-50%) translateY(12px);
          opacity: 0;
          background: rgba(10,10,10,0.85);
          color: #fff;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.5rem 1rem;
          border-radius: 2px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .home-product-card:hover .home-product-quick {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .home-product-body h3 {
          margin: 0 0 0.35rem;
          font-family: var(--font-sans);
          font-size: 0.92rem;
          font-weight: 500;
          line-height: 1.35;
        }
        .home-product-material {
          margin: 0 0 0.35rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .home-product-price {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--accent-gold);
        }
        .home-section-block {
          margin-bottom: 4rem;
        }
        .home-sale-banner {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 2rem;
          align-items: center;
          padding: 2.5rem;
          margin-bottom: 4rem;
          border-radius: 4px;
          background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,255,255,0.03));
          border: 1px solid var(--border-subtle);
        }
        .home-sale-banner h2 {
          margin: 0 0 0.75rem;
          font-family: var(--font-serif);
          font-size: 2.25rem;
        }
        .home-sale-banner p {
          margin: 0 0 1.25rem;
          color: var(--text-muted);
          max-width: 420px;
        }
        .home-sale-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .home-sale-grid a {
          display: block;
          border-radius: 4px;
          overflow: hidden;
          aspect-ratio: 1;
        }
        .home-sale-grid img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .home-loading {
          text-align: center;
          padding: 4rem 0;
          color: var(--text-muted);
        }
        @media (max-width: 1024px) {
          .home-categories { grid-template-columns: repeat(3, 1fr); }
          .home-product-grid { grid-template-columns: repeat(3, 1fr); }
          .home-sale-banner { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .home-categories { grid-template-columns: repeat(2, 1fr); }
          .home-product-grid { grid-template-columns: repeat(2, 1fr); gap: 0.85rem; }
        }
      `}</style>

      {/* Promo bar ? Almas-style marquee */}
      <div className="home-announce">
        <div className="home-announce-track">
          <span>Free shipping on orders over $100</span>
          <span>New season fine jewelry ? shop now</span>
          <span>Exclusive gold & diamond collections</span>
          <span>Free shipping on orders over $100</span>
          <span>New season fine jewelry ? shop now</span>
          <span>Exclusive gold & diamond collections</span>
        </div>
      </div>

      <div className="home-inner">
        <section className="home-mega-hero">
          <img
            className="home-mega-hero-bg"
            src="/images/home-hero-banner.jpg"
            alt="JEWELSAFA collection"
            loading="eager"
            fetchPriority="high"
          />
          <div className="home-mega-hero-overlay" aria-hidden="true" />
          <div className="home-mega-hero-content">
            <h1 className="home-mega-brand">JEWELSAFA</h1>
            <p className="home-mega-caption">
              Where timeless elegance meets modern craft ? rings, necklaces, earrings and more,
              curated for moments that last forever.
            </p>
            <a href="#collection" className="btn btn-primary home-mega-cta">
              Shop the collection <ArrowRight size={18} />
            </a>
          </div>
        </section>

        {/* Shop by category */}
        <section className="home-section-block">
          <div className="home-section-head">
            <h2>Shop by Category</h2>
          </div>
          <div className="home-categories">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="home-category-card"
              >
                <div className="home-category-media">
                  <img
                    src={getCategoryImage(cat.slug, cat.fallback)}
                    alt={cat.label}
                    loading="lazy"
                  />
                </div>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="home-loading">Loading collection?</div>
        ) : (
          <>
            {/* New Arrivals */}
            <section id="collection" className="home-section-block">
              <div className="home-section-head">
                <h2>New Arrivals</h2>
                <a href="#collection">
                  View all <ArrowRight size={14} />
                </a>
              </div>
              <div className="home-product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>

            {/* Best sellers / featured ? Almas "Discover more" style */}
            {bestSellers.length > 0 && (
              <section className="home-sale-banner">
                <div>
                  <p
                    style={{
                      margin: '0 0 0.5rem',
                      fontSize: '0.75rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    Handpicked luxury
                  </p>
                  <h2>Our Best Sellers</h2>
                  <p>
                    Timeless designs crafted in gold, silver, and precious stones ?
                    the pieces our customers love most.
                  </p>
                  <Link to="/category/rings" className="btn btn-primary">
                    Discover more
                  </Link>
                </div>
                <div className="home-sale-grid">
                  {bestSellers.map((product) => (
                    <Link key={product._id} to={`/product/${product._id}`}>
                      <img src={product.image} alt={product.name} loading="lazy" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Trending */}
            {recommendations.length > 0 && (
              <section id="trending" className="home-section-block">
                <div className="home-section-head">
                  <h2>
                    <Sparkles
                      size={20}
                      style={{ verticalAlign: 'middle', marginRight: '0.35rem' }}
                    />
                    Trending For You
                  </h2>
                  <a href="#trending">
                    View all <ArrowRight size={14} />
                  </a>
                </div>
                <div className="home-product-grid">
                  {recommendations.map((product) => (
                    <ProductCard key={`rec_${product._id}`} product={product} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
