import { Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Footer = () => {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  // Footer column accordion (mobile)
  const [openFooterCol, setOpenFooterCol] = useState(null);
  const toggleFooterCol = (col) => setOpenFooterCol(prev => prev === col ? null : col);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get('/api/reviews');
        setReviews(data);
      } catch (err) {
        console.error('Error fetching store reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/newsletter/subscribe', { email: email.trim() });
      setStatus(data.message || 'Subscribed!');
      setEmail('');
    } catch (err) {
      setStatus(err.response?.data?.message || err.message || 'Subscribe failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewError('Please fill out all fields.');
      return;
    }
    setReviewError('');
    setSubmittingReview(true);
    try {
      const { data } = await axios.post('/api/reviews', {
        name: reviewName.trim(),
        rating: Number(reviewRating),
        comment: reviewComment.trim()
      });
      setReviews(prev => [data, ...prev]);
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        {/* Reviews Section */}
        <div className="site-footer-reviews">
          <div className="footer-reviews-header">
            <div>
              <h2 className="site-footer-heading">What Our Clients Say</h2>
              <div className="footer-reviews-rating-summary">
                <span className="stars-glow">
                  {'★'.repeat(Math.round(Number(averageRating)))}{'☆'.repeat(5 - Math.round(Number(averageRating)))}
                </span>
                <span className="rating-text">
                  {averageRating} / 5 rating based on {reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
            <button 
              className="btn btn-outline" 
              onClick={() => {
                setShowReviewForm(!showReviewForm);
                if (user && !reviewName) {
                  setReviewName(user.name);
                }
              }}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {/* Dynamic Review Submission Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="review-submission-form glass-panel fade-in">
              <h3>Share your experience</h3>
              {reviewError && <p className="review-form-error">{reviewError}</p>}
              <div className="review-form-grid">
                <div className="form-group">
                  <label htmlFor="review-name">Your Name</label>
                  <input
                    id="review-name"
                    type="text"
                    placeholder="Enter your name"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="review-rating">Rating</label>
                  <div className="star-rating-selector">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`star-select-btn ${num <= reviewRating ? 'active' : ''}`}
                        onClick={() => setReviewRating(num)}
                        aria-label={`Rate ${num} stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="review-comment">Review Description</label>
                <textarea
                  id="review-comment"
                  rows="3"
                  placeholder="Share details of your experience with JEWELSAFA..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                {submittingReview ? <Loader2 size={16} className="site-footer-spinner" aria-hidden /> : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Dynamic Reviews List */}
          <div className="footer-reviews-grid">
            {reviews.slice(0, 3).map((rev) => (
              <div key={rev._id} className="review-card glass-panel fade-in">
                <div className="review-stars">
                  {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                </div>
                <p className="review-text">"{rev.comment}"</p>
                <div className="review-author">
                  <span className="author-name">{rev.name}</span>
                  {rev.verified && <span className="verified-badge">✓ Verified Buyer</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="site-footer-newsletter">
          <div>
            <h2 className="site-footer-heading">Join our list</h2>
            <p className="text-muted">
              Early access to drops, polishing tips, and members-only edits from JEWELSAFA — no spam.
            </p>
          </div>
          <form className="site-footer-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email for newsletter"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="site-footer-spinner" aria-hidden /> : 'Subscribe'}
            </button>
          </form>
          {status ? <p className="site-footer-form-note">{status}</p> : null}
        </div>

        <div className="site-footer-columns">
          <div className="site-footer-col">
            <h3>JEWELSAFA</h3>
            <p className="text-muted">
              Rings, necklaces, earrings, bracelets and bangles — curated for shine that lasts beyond the occasion.
            </p>
            <div className="site-footer-social-row">
              <a href="https://www.facebook.com/" className="site-footer-social-icon facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white"/>
                </svg>
              </a>
              <a href="https://wa.me/" className="site-footer-social-icon whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="white"/>
                </svg>
              </a>
              <a href="https://twitter.com/" className="site-footer-social-icon twitter" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="white"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/" className="site-footer-social-icon instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C9.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="white"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Column with accordion */}
          <div className="site-footer-col">
            <button className="footer-col-toggle" onClick={() => toggleFooterCol('shop')}>
              <h3 style={{ margin: 0 }}>Shop</h3>
              <span className="footer-col-icon">{openFooterCol === 'shop' ? '−' : '+'}</span>
            </button>
            <div className={`footer-col-links ${openFooterCol === 'shop' ? 'open' : ''}`}>
              <Link to="/category/rings">Rings</Link>
              <Link to="/category/necklaces">Necklaces</Link>
              <Link to="/category/earrings">Earrings</Link>
              <Link to="/category/bracelets">Bracelets</Link>
              <Link to="/category/bangles">Bangles</Link>
            </div>
          </div>

          {/* Help Column with accordion */}
          <div className="site-footer-col">
            <button className="footer-col-toggle" onClick={() => toggleFooterCol('help')}>
              <h3 style={{ margin: 0 }}>Help</h3>
              <span className="footer-col-icon">{openFooterCol === 'help' ? '−' : '+'}</span>
            </button>
            <div className={`footer-col-links ${openFooterCol === 'help' ? 'open' : ''}`}>
              <Link to="/track-order">Track order</Link>
              <Link to="/contact">Contact us</Link>
              <Link to="/contact#shipping">Shipping policy</Link>
              <Link to="/contact#returns">Returns</Link>
              <Link to="/auth">Account / Sign in</Link>
            </div>
          </div>

          {/* Reach us Column with accordion */}
          <div className="site-footer-col">
            <button className="footer-col-toggle" onClick={() => toggleFooterCol('reach')}>
              <h3 style={{ margin: 0 }}>Reach us</h3>
              <span className="footer-col-icon">{openFooterCol === 'reach' ? '−' : '+'}</span>
            </button>
            <div className={`footer-col-links ${openFooterCol === 'reach' ? 'open' : ''}`}>
              <p className="text-muted">Mon–Sat, 10am–6pm</p>
              <a href="mailto:hello@jewelsafa.example">hello@jewelsafa.example</a>
              <p className="text-muted site-footer-muted-small">Replace this email with your real support address anytime.</p>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p className="text-muted">&copy; {new Date().getFullYear()} JEWELSAFA. All rights reserved.</p>
          <div className="site-footer-bottom-links">
            <Link to="/">Home</Link>
            <span aria-hidden>|</span>
            <Link to="/contact">Contact</Link>
            <span aria-hidden>|</span>
            <Link to="/track-order">Track order</Link>
          </div>
        </div>

        <div className="secure-checkout-section">
          <span className="secure-checkout-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--accent-gold)' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            100% SECURE CHECKOUT
          </span>
          <div className="secure-checkout-badges">
            <div className="payment-badge-wrapper" title="Visa">
              <svg viewBox="0 0 48 32" width="38" height="24" className="payment-badge">
                <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#FFF" fontSize="11" fontWeight="bold" fontStyle="italic" fontFamily="sans-serif">VISA</text>
              </svg>
            </div>
            <div className="payment-badge-wrapper" title="Mastercard">
              <svg viewBox="0 0 48 32" width="38" height="24" className="payment-badge">
                <rect width="48" height="32" rx="4" fill="#111"/>
                <circle cx="20" cy="16" r="7" fill="#EB001B"/>
                <circle cx="28" cy="16" r="7" fill="#F79E1B" fillOpacity="0.85"/>
              </svg>
            </div>
            <div className="payment-badge-wrapper" title="HBL (Habib Bank Limited)">
              <svg viewBox="0 0 48 32" width="38" height="24" className="payment-badge">
                <rect width="48" height="32" rx="4" fill="#006A4E"/>
                <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="900" fontFamily="sans-serif">HBL</text>
              </svg>
            </div>
            <div className="payment-badge-wrapper" title="Easypaisa">
              <svg viewBox="0 0 48 32" width="38" height="24" className="payment-badge">
                <rect width="48" height="32" rx="4" fill="#39B54A"/>
                <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">easypaisa</text>
              </svg>
            </div>
            <div className="payment-badge-wrapper" title="JazzCash">
              <svg viewBox="0 0 48 32" width="38" height="24" className="payment-badge">
                <rect width="48" height="32" rx="4" fill="#FFC72C"/>
                <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold" fontFamily="sans-serif">JazzCash</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
