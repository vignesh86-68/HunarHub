import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import Problem from '../components/common/Problem';

export default function ProductDetail() {
  const { id } = useParams();
  const { auth, request, rupees } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');
  const [showCheckout, setShowCheckout] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus('loading');
      const data = await request(`/products/${id}`);
      setProduct(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [id, request]);

  useEffect(() => { load(); }, [load]);

  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <Problem />;
  if (!product) return null;

  return (
    <div className="page-stack">
      <div className="product-detail-layout">
        {/* Product Art */}
        <div className="product-detail-art">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="product-detail-img" />
          ) : (
            <>
              <span className="product-detail-icon">{product.category?.[0] || '🎁'}</span>
              <span className="product-detail-category">{product.category}</span>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="product-detail-info">
          <Link
            to={product.entrepreneur ? `/entrepreneurs/${product.entrepreneur._id}` : '/entrepreneurs'}
            className="craft-label"
            style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '12px' }}
          >
            🔨 {product.entrepreneur?.businessName || 'Local maker'} ↗
          </Link>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.1, marginBottom: '16px' }}>
            {product.name}
          </h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
            {product.description}
          </p>
          <div className="product-detail-meta">
            <div className="price-tag">{rupees(product.price)}</div>
            <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="cta-row" style={{ marginTop: '28px' }}>
            {auth?.role === 'customer' && product.stock > 0 && (
              <button className="btn btn-primary" onClick={() => setShowCheckout(true)}>
                Buy now →
              </button>
            )}
            {!auth && (
              <Link className="btn btn-primary" to="/auth">Sign in to purchase →</Link>
            )}
            {auth?.role === 'customer' && product.entrepreneur && (
              <Link className="btn btn-ghost" to={`/entrepreneurs/${product.entrepreneur._id}`}>
                Visit maker profile
              </Link>
            )}
            <Link className="btn btn-ghost" to="/products">← All products</Link>
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          product={product}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            toast.success('Order placed! 🎉');
            navigate('/dashboard');
          }}
          request={request}
          auth={auth}
          rupees={rupees}
        />
      )}
    </div>
  );
}

function CheckoutModal({ product, onClose, onSuccess, request, auth, rupees }) {
  const [form, setForm] = useState({ quantity: 1, deliveryAddress: auth?.location || '' });
  const [saving, setSaving] = useState(false);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const qty = Math.min(Math.max(1, Number(form.quantity) || 1), product.stock);
  const total = product.price * qty;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.deliveryAddress) {
      toast.error('Please enter a delivery address.');
      return;
    }
    setSaving(true);
    try {
      await request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          entrepreneur: product.entrepreneur._id,
          product: product._id,
          quantity: qty,
          deliveryAddress: form.deliveryAddress
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
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Checkout</p>
            <h2>{product.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="checkout-product-row">
          <span className="checkout-icon">{product.category?.[0] || '🎁'}</span>
          <div>
            <strong>{product.name}</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
              {product.entrepreneur?.businessName} · {product.category}
            </p>
          </div>
          <strong style={{ color: 'var(--green)', fontSize: '18px', marginLeft: 'auto' }}>
            {rupees(product.price)}
          </strong>
        </div>

        <form className="form-card" onSubmit={submit}>
          <div className="form-split">
            <label>
              Quantity (max {product.stock})
              <input
                type="number" name="quantity" min={1} max={product.stock}
                value={form.quantity} onChange={change} required
              />
            </label>
            <div className="order-total-box">
              <span>Order total</span>
              <strong>{rupees(total)}</strong>
            </div>
          </div>
          <label>
            Delivery address <span style={{ color: 'red' }}>*</span>
            <input
              name="deliveryAddress" value={form.deliveryAddress}
              onChange={change} required placeholder="Your full delivery address"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Placing order…' : `Place order · ${rupees(total)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
