import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import Problem from '../components/common/Problem';
import Empty from '../components/common/Empty';

const CATEGORIES = ['Cobbler', 'Potter', 'Tailor', 'Artisan', 'Small Vendor', 'Other'];

const CATEGORY_ICONS = {
  Cobbler: '👟', Potter: '🏺', Tailor: '🧵', Artisan: '🎨',
  'Small Vendor': '🛒', Other: '✨'
};

export default function Makers() {
  const { request } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [filters, setFilters] = useState({ search: '', category: '', location: '' });

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v)
    ).toString();
    setStatus('loading');
    request(`/entrepreneurs${params ? `?${params}` : ''}`)
      .then(data => alive && (setItems(data), setStatus('ready')))
      .catch(() => alive && setStatus('error'));
    return () => { alive = false; };
  }, [filters, request]);

  return (
    <section className="page-section">
      <header className="page-heading">
        <p className="eyebrow">Maker directory</p>
        <h1>Meet the people behind the craft.</h1>
        <p>Search skilled local entrepreneurs and discover the work they love.</p>
      </header>

      {/* Filters */}
      <div className="filter-bar">
        <input
          placeholder="Search by business name…"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          aria-label="Search by business name"
        />
        <select
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          aria-label="Filter by craft category"
        >
          <option value="">All crafts</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input
          placeholder="City or area…"
          value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
          aria-label="Filter by location"
        />
      </div>

      {status === 'loading' && <Spinner />}
      {status === 'error' && <Problem />}
      {status === 'ready' && (
        items.length
          ? <div className="card-grid">{items.map(x => <MakerCard key={x._id} maker={x} />)}</div>
          : <Empty text="No makers match those filters. Try clearing your search." />
      )}
    </section>
  );
}

function MakerCard({ maker }) {
  const icon = CATEGORY_ICONS[maker.skillCategory] || '✨';
  return (
    <article className="maker-card">
      <div className="maker-avatar">
        {maker.profileImage ? <img src={maker.profileImage} alt={maker.businessName} /> : icon}
      </div>
      <div className="maker-card__head">
        <div>
          <p className="craft-label">{maker.skillCategory}</p>
          <h3>{maker.businessName}</h3>
          <p>📍 {maker.location}</p>
        </div>
        {maker.averageRating > 0 && (
          <span className="rating">★ {maker.averageRating}</span>
        )}
      </div>
      <p className="maker-description">
        {maker.description || 'A local professional ready to bring their craft to your next project.'}
      </p>
      <div className="card-footer">
        <span>{maker.totalReviews || 0} reviews</span>
        <Link to={`/entrepreneurs/${maker._id}`}>View profile &rarr;</Link>
      </div>
    </article>
  );
}
