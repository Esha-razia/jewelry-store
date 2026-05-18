const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4rem', padding: '3rem 0', textAlign: 'center' }}>
      <div className="container">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AURORA JEWELS</h2>
        <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 2rem auto' }}>
          Crafting timeless elegance and illuminating your inner beauty with our bespoke collection of premium jewelry.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Shipping Policy</a>
          <a href="#">Returns</a>
        </div>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>&copy; {new Date().getFullYear()} Aurora Jewels. Built by DeepMind Advanced Agentic AI.</p>
      </div>
    </footer>
  );
};

export default Footer;
