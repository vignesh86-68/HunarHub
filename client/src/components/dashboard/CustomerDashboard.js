import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';
import Empty from '../common/Empty';

const STATUS_CLASSES = {
  pending: 'status--pending', confirmed: 'status--accepted',
  processing: 'status--accepted', delivered: 'status--approved',
  cancelled: 'status--rejected', accepted: 'status--accepted',
  rejected: 'status--rejected', completed: 'status--approved'
};

export default function CustomerDashboard() {
  const { auth, request, rupees } = useAuth();
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(null); // order for review

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, r] = await Promise.all([
        request('/orders/my-orders'),
        request('/service-requests/my-requests')
      ]);
      setOrders(o);
      setRequests(r);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { load(); }, [load]);

  const cancelOrder = async (id) => {
    try {
      await request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) });
      toast.success('Order cancelled.');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const activeRequests = requests.filter(r => !['completed', 'rejected'].includes(r.status));

  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <p className="eyebrow">Customer workspace</p>
        <h1>Good to see you, {auth.name?.split(' ')[0]}.</h1>
        <p>Your marketplace activity, all in one place.</p>
      </header>

      {/* Metrics */}
      <div className="metric-row">
        {[
          ['Orders', orders.length, 'Your purchases'],
          ['Requests', requests.length, 'Services booked'],
          ['Active', activeRequests.length, 'Need attention'],
        ].map(([a, b, c]) => (
          <article className="metric-card" key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
            <small>{c}</small>
          </article>
        ))}
        <article className="metric-card metric-card--action">
          <span>Explore</span>
          <p>Discover more local makers</p>
          <Link to="/entrepreneurs" className="btn btn-primary btn-small">Browse makers →</Link>
        </article>
      </div>

      {loading ? <Spinner /> : (
        <div className="dashboard-grid">
          {/* Orders Panel */}
          <article className="dashboard-card">
            <div className="panel-heading">
              <p className="eyebrow">Orders</p>
              <h2>Your purchases</h2>
            </div>
            {orders.length ? (
              <div className="simple-list">
                {orders.slice(0, 8).map(o => (
                  <div className="request-row" key={o._id}>
                    <div>
                      <strong>{o.product?.name || 'Product'}</strong>
                      <small>{o.entrepreneur?.businessName} · Qty {o.quantity} · {rupees(o.totalPrice)}</small>
                    </div>
                    <div className="row-actions">
                      <span className={`status ${STATUS_CLASSES[o.status] || ''}`}>{o.status}</span>
                      {o.status === 'pending' && (
                        <button className="text-button" onClick={() => cancelOrder(o._id)}>Cancel</button>
                      )}
                      {o.status === 'delivered' && (
                        <button className="text-button accept" onClick={() => setShowReview(o)}>Review</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No orders yet. Browse products to get started." />
            )}
          </article>

          {/* Service Requests Panel */}
          <article className="dashboard-card">
            <div className="panel-heading">
              <p className="eyebrow">Service Requests</p>
              <h2>Your bookings</h2>
            </div>
            {requests.length ? (
              <div className="simple-list">
                {requests.slice(0, 8).map(r => (
                  <div className="request-row" key={r._id}>
                    <div>
                      <strong>{r.entrepreneur?.businessName || 'Maker'}</strong>
                      <small style={{ display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.description}
                      </small>
                    </div>
                    <span className={`status ${STATUS_CLASSES[r.status] || ''}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No service requests yet. Find a maker to get started." />
            )}
          </article>
        </div>
      )}

      {showReview && (
        <ReviewModal
          order={showReview}
          onClose={() => setShowReview(null)}
          onSuccess={() => { setShowReview(null); toast.success('Review submitted! Thank you.'); load(); }}
          request={request}
        />
      )}
    </div>
  );
}

function ReviewModal({ order, onClose, onSuccess, request }) {
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await request('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          entrepreneur: order.entrepreneur?._id || order.entrepreneur,
          product: order.product?._id || order.product,
          rating: form.rating,
          comment: form.comment
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
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Leave a Review</p>
            <h2>{order.product?.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form className="form-card" onSubmit={submit}>
          <label>
            Your rating
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n} type="button"
                  className={`star-btn ${form.rating >= n ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, rating: n }))}
                  aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                >★</button>
              ))}
            </div>
          </label>
          <label>
            Comment (optional)
            <textarea
              name="comment" value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience…"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Submitting…' : 'Submit review →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
