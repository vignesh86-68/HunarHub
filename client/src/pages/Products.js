import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import Problem from '../components/common/Problem';
import Empty from '../components/common/Empty';

const CATEGORY_COLORS = {
  Cobbler: '#7C3AED', Potter: '#B45309', Tailor: '#0284C7',
  Artisan: '#059669', 'Small Vendor': '#DC2626', Other: '#64748B'
};

export default function Products() {
  const { request, rupees } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [filters, setFilters] = useState({ search: '', category: '' });

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v)
    ).toString();
    setStatus('loading');
    request(`/products${params ? `?${params}` : ''}`)
      .then(data => alive && (setItems(data), setStatus('ready')))
      .catch(() => alive && setStatus('error'));
    return () => { alive = false; };
  }, [filters, request]);

  const categories = ['Artisan', 'Cobbler', 'Potter', 'Tailor', 'Small Vendor', 'Other'];

  return (
    <section className="page-section">
      <header className="page-heading">
        <p className="eyebrow">Marketplace</p>
        <h1>Objects made with intention.</h1>
        <p>Support local business and bring home something with a story.</p>
      </header>

      <div className="filter-bar">
        <input
          placeholder="Search products…"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          aria-label="Search products"
        />
        <select
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {status === 'loading' && <Spinner />}
      {status === 'error' && <Problem />}
      {status === 'ready' && (
        items.length
          ? (
            <div className="card-grid product-grid">
              {items.map(x => (
                <article className="product-card" key={x._id}>
                  <div className="product-art" style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[x.category] || '#059669'}, ${CATEGORY_COLORS[x.category] || '#059669'}99)` }}>
                    {x.images?.[0] ? (
                      <img src={x.images[0]} alt={x.name} className="product-art-img" />
                    ) : (
                      <>
                        <span>{x.category?.[0] || '🎁'}</span>
                        <small>{x.category}</small>
                      </>
                    )}
                  </div>
                  <div className="product-copy">
                    <p className="craft-label">{x.entrepreneur?.businessName || 'Local maker'}</p>
                    <h3>{x.name}</h3>
                    <p>{x.description}</p>
                    <div className="card-footer">
                      <strong style={{ color: 'var(--green)', fontSize: '16px' }}>{rupees(x.price)}</strong>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{x.stock} in stock</span>
                        <Link to={`/products/${x._id}`} className="btn btn-small btn-primary">View →</Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
          : <Empty text="The product collection is growing. Check back soon." />
      )}
    </section>
  );
}
