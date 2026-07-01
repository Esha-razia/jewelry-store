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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://wa.me/" className="site-footer-social-icon whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </a>
              <a href="https://twitter.com/" className="site-footer-social-icon twitter" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="https://www.instagram.com/" className="site-footer-social-icon instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
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
