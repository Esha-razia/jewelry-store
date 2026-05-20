import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

// Lightweight client-side SEO preview generator (for NEW products before save)
const localGenerateSEO = ({ name, category, material, brand, description }) => {
  const n = (name || '').trim();
  const b = (brand || 'JEWELSAFA').trim();
  const m = (material || '').trim();
  const c = (category || '').trim();
  const d = (description || '').trim();

  let title = `${n} | ${b}`;
  if (title.length > 60) title = title.slice(0, 57) + '...';

  const matPhrase = m ? `Crafted from ${m}` : 'Exquisitely crafted';
  const catPhrase = c ? `${c.toLowerCase()} piece` : 'jewelry piece';
  const descSnip  = d.length > 60 ? d.slice(0, 57).replace(/\s+\S*$/, '') + '...' : d;
  let desc = `${matPhrase}, this ${catPhrase} from ${b} — ${descSnip} Shop now for free shipping & elegant gift packaging.`;
  if (desc.length > 160) desc = desc.slice(0, 157) + '...';

  const tagSet = new Set();
  n.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 3) tagSet.add(w); });
  tagSet.add(c.toLowerCase()); tagSet.add(m.toLowerCase()); tagSet.add(b.toLowerCase());
  ['luxury', 'handcrafted', 'fine jewelry'].forEach(t => tagSet.add(t));
  const tags = [...tagSet].filter(Boolean).slice(0, 8);

  return { metaTitle: title, metaDescription: desc, seoTags: tags.join(', ') };
};

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [seoSuccess, setSeoSuccess] = useState(false);
  // Inline confirm-delete state (replaces browser window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { user, logout } = useContext(AuthContext);

  // Core fields
  const [name, setName]               = useState('');
  const [price, setPrice]             = useState(0);
  const [image, setImage]             = useState('');
  const [brand, setBrand]             = useState('');
  const [category, setCategory]       = useState('Rings');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [material, setMaterial]       = useState('');

  // SEO fields
  const [seoTags, setSeoTags]                   = useState('');
  const [metaTitle, setMetaTitle]               = useState('');
  const [metaDescription, setMetaDescription]   = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    setSeoSuccess(false);
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setPrice(product.price);
      setImage(product.image);
      setBrand(product.brand || '');
      setCategory(product.category || 'Rings');
      setCountInStock(product.countInStock);
      setDescription(product.description);
      setMaterial(product.material || '');
      setSeoTags(product.seoTags?.join(', ') || '');
      setMetaTitle(product.metaTitle || '');
      setMetaDescription(product.metaDescription || '');
    } else {
      setEditingProduct(null);
      setName('New Jewelry Piece');
      setPrice(99);
      setImage('/images/sample.jpg');
      setBrand('JEWELSAFA');
      setCategory('Rings');
      setMaterial('18k Gold');
      setCountInStock(5);
      setDescription('Exquisite craftsmanship...');
      setSeoTags('jewelry, ring, luxury');
      setMetaTitle('');
      setMetaDescription('');
    }
    setErrorMsg('');
    setShowModal(true);
  };

  // ── AI SEO generation ──────────────────────────────────────────────────────
  const handleGenerateSEO = async () => {
    setSeoGenerating(true);
    setSeoSuccess(false);
    try {
      if (editingProduct) {
        // Saved product: call backend AI endpoint
        const config = { headers: { Authorization: 'Bearer ' + user.token } };
        const { data } = await axios.post(`/api/products/${editingProduct._id}/generate-seo`, {}, config);
        setMetaTitle(data.metaTitle);
        setMetaDescription(data.metaDescription);
        setSeoTags(data.seoTags.join(', '));
      } else {
        // New product: generate locally from current form state
        const result = localGenerateSEO({ name, category, material, brand, description });
        setMetaTitle(result.metaTitle);
        setMetaDescription(result.metaDescription);
        setSeoTags(result.seoTags);
      }
      setSeoSuccess(true);
      setTimeout(() => setSeoSuccess(false), 3000);
    } catch (err) {
      console.error('SEO generation failed:', err);
      window.alert('SEO generation failed. Please try again.');
    } finally {
      setSeoGenerating(false);
    }
  };

  // ── Save / update product ──────────────────────────────────────────────────
  const submitHandler = async (e) => {
    e.preventDefault();
    const productData = {
      name, price: Number(price), image, brand, category,
      countInStock: Number(countInStock), description, material,
      seoTags: seoTags.split(',').map(t => t.trim()).filter(Boolean),
      metaTitle,
      metaDescription,
    };
    try {
      const config = { headers: { Authorization: 'Bearer ' + user.token } };
      if (editingProduct) {
        await axios.put('/api/products/' + editingProduct._id, productData, config);
      } else {
        await axios.post('/api/products', productData, config);
      }
      setShowModal(false);
      setErrorMsg('');
      fetchProducts();
    } catch (err) {
      console.error('Save failed:', err);
      const msg = err.response?.data?.message || 'Failed to save product';
      setErrorMsg(msg);
      window.alert('Error: ' + msg);
    }
  };

  const deleteHandler = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!user || !user.token) {
      window.alert('Not logged in. Please log out and log back in as Admin.');
      return;
    }
    setDeleteLoading(true);
    try {
      const config = { headers: { Authorization: 'Bearer ' + user.token } };
      await axios.delete('/api/products/' + confirmDeleteId, config);
      setConfirmDeleteId(null);
      fetchProducts();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Delete failed';
      if (status === 401) {
        window.alert('Session expired. Please log out and log back in, then try again.');
        if (logout) logout();
      } else {
        window.alert('Delete error: ' + msg);
      }
      console.error('Delete error:', status, msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Character counters for SEO ─────────────────────────────────────────────
  const titleLen = metaTitle.length;
  const descLen  = metaDescription.length;
  const titleColor  = titleLen > 60  ? '#ff6b6b' : titleLen > 50  ? '#ffa502' : '#2ed573';
  const descColor   = descLen  > 160 ? '#ff6b6b' : descLen  > 140 ? '#ffa502' : '#2ed573';

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2>Jewelry Inventory</h2>
        <button onClick={() => openModal()} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
          + Add Product
        </button>
      </div>

      {loading ? <p>Loading inventory...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>NAME</th><th>PRICE</th><th>STOCK</th><th>SEO</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} style={{ fontSize: '0.9rem' }}>
                  <td className="text-muted">{product._id.substring(18)}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.countInStock}</td>
                  <td>
                    {product.metaTitle
                      ? <span style={{ color: '#2ed573', fontSize: '0.75rem' }}>✓ Set</span>
                      : <span style={{ color: '#ff6b6b', fontSize: '0.75rem' }}>✗ Missing</span>}
                  </td>
                  <td>
                    <button onClick={() => openModal(product)} className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', marginRight: '0.5rem' }}>Edit</button>
                    <button onClick={() => deleteHandler(product._id)} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: deleteLoading ? '#a5a5a5' : '#ff6b6b', color: '#fff' }} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Del'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
            <h3 className="text-gold" style={{ marginBottom: '1.5rem' }}>
              {editingProduct ? 'Update Product' : 'Create New Product'}
            </h3>

            {errorMsg && (
              <div style={{ color: '#ff6b6b', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={submitHandler}>
              {/* ── Row 1: Name + Price ── */}
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
              </div>

              {/* ── Row 2: Brand + Material ── */}
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Brand</label>
                  <input value={brand} onChange={e => setBrand(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Material</label>
                  <input value={material} onChange={e => setMaterial(e.target.value)} required />
                </div>
              </div>

              {/* ── Image ── */}
              <div className="form-group">
                <label>Image URL</label>
                <input value={image} onChange={e => setImage(e.target.value)} required />
              </div>

              {/* ── Row 3: Category + Stock ── */}
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Rings">Rings</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Pendants">Pendants</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock Count</label>
                  <input type="number" value={countInStock} onChange={e => setCountInStock(e.target.value)} required />
                </div>
              </div>

              {/* ── Description ── */}
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>

              {/* ── SEO Section ── */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(212,175,55,0.25)',
                background: 'rgba(212,175,55,0.04)',
              }}>
                {/* SEO Header + AI Button */}
                <div className="flex-between" style={{ marginBottom: '1rem', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1rem' }}>
                    🔍 SEO & Meta Tags
                  </h4>
                  <button
                    type="button"
                    onClick={handleGenerateSEO}
                    disabled={seoGenerating}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.8rem',
                      background: seoSuccess
                        ? 'rgba(46,213,115,0.15)'
                        : 'rgba(212,175,55,0.15)',
                      color: seoSuccess ? '#2ed573' : 'var(--accent-gold)',
                      border: `1px solid ${seoSuccess ? '#2ed573' : 'var(--accent-gold)'}`,
                      cursor: seoGenerating ? 'wait' : 'pointer',
                      transition: 'all 0.3s ease',
                      fontWeight: '600',
                    }}
                  >
                    {seoGenerating ? '⏳ Generating...' : seoSuccess ? '✓ Generated!' : '✨ Generate with AI'}
                  </button>
                </div>

                {/* Meta Title */}
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <label style={{ margin: 0 }}>Meta Title</label>
                    <span style={{ fontSize: '0.75rem', color: titleColor }}>{titleLen}/60</span>
                  </div>
                  <input
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    placeholder="e.g. 24k Gold Chain Necklace | JEWELSAFA"
                    maxLength={80}
                  />
                  {titleLen > 60 && (
                    <p style={{ color: '#ff6b6b', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>
                      ⚠ Over 60 characters — search engines may truncate this
                    </p>
                  )}
                </div>

                {/* Meta Description */}
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <label style={{ margin: 0 }}>Meta Description</label>
                    <span style={{ fontSize: '0.75rem', color: descColor }}>{descLen}/160</span>
                  </div>
                  <textarea
                    rows="3"
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    placeholder="A short, compelling description shown in search results (max 160 chars)"
                    maxLength={200}
                  />
                  {descLen > 160 && (
                    <p style={{ color: '#ff6b6b', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>
                      ⚠ Over 160 characters — search engines may truncate this
                    </p>
                  )}
                </div>

                {/* SEO Tags */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>SEO Keywords <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>(comma-separated)</span></label>
                  <input
                    value={seoTags}
                    onChange={e => setSeoTags(e.target.value)}
                    placeholder="e.g. gold necklace, luxury jewelry, 24k gold, gift for her"
                  />
                  {seoTags && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {seoTags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                        <span key={i} style={{
                          background: 'rgba(212,175,55,0.12)',
                          color: 'var(--accent-gold)',
                          border: '1px solid rgba(212,175,55,0.3)',
                          borderRadius: '4px',
                          padding: '0.1rem 0.45rem',
                          fontSize: '0.75rem',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                {editingProduct ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel modal-content fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%', textAlign: 'center', padding: '2rem', position: 'relative' }}>
            <h3 style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '1.5rem' }}>Confirm Delete</h3>
            <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#e0e0e0' }}>You really want to delete this product?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={confirmDelete} className="btn" style={{ background: '#ff6b6b', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', minWidth: '100px' }} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Ok'}
              </button>
              <button onClick={() => setConfirmDeleteId(null)} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', minWidth: '100px' }} disabled={deleteLoading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
