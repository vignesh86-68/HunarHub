import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import Problem from '../components/common/Problem';

const CATEGORY_ICONS = {
  Cobbler: '👟', Potter: '🏺', Tailor: '🧵', Artisan: '🎨',
  'Small Vendor': '🛒', Other: '✨'
};

export default function MakerDetail() {
  const { id } = useParams();
  const { auth, request, rupees } = useAuth();
  const navigate = useNavigate();

  const [maker, setMaker] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showBooking, setShowBooking] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus('loading');
      const [makerData, reviewData, productData] = await Promise.all([
        request(`/entrepreneurs/${id}`),
        request(`/reviews/entrepreneur/${id}`),
        request(`/products?entrepreneurId=${id}`)
      ]);
      setMaker(makerData);
      setReviews(reviewData);
      setProducts(productData);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [id, request]);

  useEffect(() => { load(); }, [load]);

  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <Problem />;
  if (!maker) return null;

  const icon = CATEGORY_ICONS[maker.skillCategory] || '✨';

  return (
    <div className="page-stack">
      {/* Maker Profile Header */}
      <section className="maker-detail-hero">
        <div className="maker-detail-avatar">
          {maker.profileImage ? <img src={maker.profileImage} alt={maker.businessName} /> : icon}
        </div>
        <div className="maker-detail-info">
          <p className="eyebrow">{maker.skillCategory}</p>
          <h1>{maker.businessName}</h1>
          <div className="maker-meta-row">
            <span>📍 {maker.location}</span>
            <span>🕐 {maker.experience} yrs experience</span>
            {maker.averageRating > 0 && <span className="rating">★ {maker.averageRating} ({maker.totalReviews} reviews)</span>}
            {!maker.isAvailable && <span className="status status--rejected">Currently Unavailable</span>}
          </div>
          <p className="lead">{maker.description}</p>
          <div className="cta-row">
            {auth?.role === 'customer' && (
              <button className="btn btn-primary" onClick={() => setShowBooking(true)}>
                Request this service →
              </button>
            )}
            {!auth && (
              <Link className="btn btn-primary" to="/auth">Sign in to book service →</Link>
            )}
            <Link className="btn btn-ghost" to="/entrepreneurs">← Back to makers</Link>
          </div>
        </div>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section className="page-section" style={{ gap: '16px' }}>
          <h2 className="section-subheading">Products by {maker.businessName}</h2>
          <div className="card-grid product-grid">
            {products.map(p => (
              <article className="product-card" key={p._id}>
                <div className="product-art">
                  <span>{p.category?.[0] || '🎁'}</span>
                  <small>{p.category}</small>
                </div>
                <div className="product-copy">
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className="card-footer">
                    <strong style={{ color: 'var(--green)', fontSize: '16px' }}>{rupees(p.price)}</strong>
                    <Link to={`/products/${p._id}`} className="btn btn-small btn-primary">Buy now</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="page-section" style={{ gap: '16px' }}>
        <h2 className="section-subheading">Community Reviews</h2>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map(r => (
              <div className="review-card" key={r._id}>
                <div className="review-header">
                  <div className="review-avatar">{r.customer?.name?.[0] || 'C'}</div>
                  <div>
                    <strong>{r.customer?.name || 'Customer'}</strong>
                    <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <small className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</small>
                </div>
                {r.comment && <p className="review-comment">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ minHeight: 120 }}>
            <span>💬</span>
            <p>No reviews yet. Be the first to work with {maker.businessName}!</p>
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {showBooking && (
        <ServiceRequestModal
          maker={maker}
          onClose={() => setShowBooking(false)}
          onSuccess={() => { setShowBooking(false); toast.success('Service request sent!'); navigate('/dashboard'); }}
          request={request}
          auth={auth}
        />
      )}
    </div>
  );
}

function ServiceRequestModal({ maker, onClose, onSuccess, request, auth }) {
  const [form, setForm] = useState({ description: '', address: '', budget: '', preferredDate: '' });
  const [saving, setSaving] = useState(false);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.address) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      await request('/service-requests', {
        method: 'POST',
        body: JSON.stringify({
          entrepreneur: maker._id,
          description: form.description,
          address: form.address,
          budget: Number(form.budget) || 0,
          preferredDate: form.preferredDate || undefined
        })
      });
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Book service">
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Service Request</p>
            <h2>{maker.businessName}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <form className="form-card" onSubmit={submit}>
          <label>
            Describe what you need <span style={{ color: 'red' }}>*</span>
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              required
              placeholder="Tell the maker exactly what you need…"
            />
          </label>
          <label>
            Your delivery/service address <span style={{ color: 'red' }}>*</span>
            <input
              name="address"
              value={form.address}
              onChange={change}
              required
              placeholder="Full address"
            />
          </label>
          <div className="form-split">
            <label>
              Preferred date (optional)
              <input type="date" name="preferredDate" value={form.preferredDate} onChange={change} />
            </label>
            <label>
              Your budget (₹, optional)
              <input type="number" min="0" name="budget" value={form.budget} onChange={change} placeholder="0" />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Sending…' : 'Send request →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
