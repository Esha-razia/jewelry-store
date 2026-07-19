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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://wa.me/" className="site-footer-social-icon whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.745 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.906-6.99C16.474 1.875 13.998.84 11.36.84 5.924.84 1.5 5.256 1.496 10.693c-.001 1.637.478 3.238 1.386 4.666l-.934 3.41 3.5-.918zM17.5 14.1c-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.9 1.1-.17.18-.34.2-.62.06-.28-.14-1.18-.44-2.25-1.4-1.34-1.2-1.87-1.5-2.05-1.7-.18-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.49.1-.2.05-.38-.02-.52-.07-.14-.64-1.55-.88-2.12-.23-.57-.47-.49-.64-.5-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.45s1.07 2.85 1.22 3.05c.15.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.06-.11-.25-.19-.53-.33z"/>
                </svg>
              </a>
              <a href="https://twitter.com/" className="site-footer-social-icon twitter" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/" className="site-footer-social-icon instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="site-footer-col">
            <h3>Shop</h3>
            <Link to="/category/rings">Rings</Link>
            <Link to="/category/necklaces">Necklaces</Link>
            <Link to="/category/earrings">Earrings</Link>
            <Link to="/category/bracelets">Bracelets</Link>
            <Link to="/category/bangles">Bangles</Link>
          </div>
          <div className="site-footer-col">
            <h3>Help</h3>
            <Link to="/track-order">Track order</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/contact#shipping">Shipping policy</Link>
            <Link to="/contact#returns">Returns</Link>
            <Link to="/auth">Account / Sign in</Link>
          </div>
          <div className="site-footer-col">
            <h3>Reach us</h3>
            <p className="text-muted">Mon–Sat, 10am–6pm</p>
            <a href="mailto:hello@jewelsafa.example">hello@jewelsafa.example</a>
            <p className="text-muted site-footer-muted-small">Replace this email with your real support address anytime.</p>
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
