import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Share2, Loader2 } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
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
            <div className="site-footer-social" aria-hidden>
              <a href="https://www.instagram.com/" className="site-footer-social-link" target="_blank" rel="noopener noreferrer">
                <Share2 size={20} aria-hidden />
              </a>
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
      </div>
    </footer>
  );
};

export default Footer;
