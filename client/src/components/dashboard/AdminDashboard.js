import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';
import Empty from '../common/Empty';

export default function AdminDashboard() {
  const { request } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await request('/admin/dashboard');
      setData(d);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id, isApproved) => {
    try {
      await request(`/admin/entrepreneurs/${id}/approval`, {
        method: 'PUT',
        body: JSON.stringify({ isApproved })
      });
      toast.success(isApproved ? '✅ Profile approved.' : '⏳ Profile moved to review.');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <Spinner />;

  const pending = data?.recentProfiles?.filter(p => !p.isApproved) || [];
  const approved = data?.recentProfiles?.filter(p => p.isApproved) || [];

  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <p className="eyebrow">Administrator console</p>
        <h1>Marketplace health, at a glance.</h1>
        <p>Review business profiles and keep the HunarHub community moving.</p>
      </header>

      {/* Metrics */}
      <div className="metric-row">
        {[
          ['Customers', data?.metrics?.customers ?? 0, 'Registered buyers'],
          ['Entrepreneurs', data?.metrics?.entrepreneurs ?? 0, 'Business accounts'],
          ['Products', data?.metrics?.products ?? 0, 'Catalog listings'],
          ['Pending Review', data?.metrics?.pendingProfiles ?? 0, 'Awaiting approval'],
        ].map(([a, b, c]) => (
          <article className={`metric-card ${a === 'Pending Review' && b > 0 ? 'metric-card--alert' : ''}`} key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
            <small>{c}</small>
          </article>
        ))}
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'pending', label: `Pending (${pending.length})` },
          { key: 'approved', label: `Approved (${approved.length})` },
        ].map(t => (
          <button key={t.key} className={`dash-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="dashboard-grid">
          <article className="dashboard-card">
            <div className="panel-heading">
              <p className="eyebrow">Quick Stats</p>
              <h2>Platform at a glance</h2>
            </div>
            <div className="simple-list">
              {[
                ['Total orders', data?.metrics?.orders ?? 0],
                ['Service requests', data?.metrics?.requests ?? 0],
                ['Pending approvals', data?.metrics?.pendingProfiles ?? 0],
              ].map(([label, val]) => (
                <div className="simple-row" key={label}>
                  <span>{label}</span>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>
          </article>
          <article className="dashboard-card">
            <div className="panel-heading">
              <p className="eyebrow">Approval queue</p>
              <h2>Profiles needing review</h2>
            </div>
            {pending.length ? (
              <div className="simple-list">
                {pending.slice(0, 5).map(p => (
                  <ProfileRow key={p._id} profile={p} approve={approve} />
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 100 }}>
                <span>✅</span>
                <p>All profiles are approved. Great work!</p>
              </div>
            )}
          </article>
        </div>
      )}

      {activeTab === 'pending' && (
        <article className="dashboard-card">
          <div className="panel-heading">
            <p className="eyebrow">Needs attention</p>
            <h2>Pending approvals</h2>
          </div>
          {pending.length ? (
            <div className="simple-list">
              {pending.map(p => <ProfileRow key={p._id} profile={p} approve={approve} />)}
            </div>
          ) : (
            <Empty text="No profiles awaiting approval." />
          )}
        </article>
      )}

      {activeTab === 'approved' && (
        <article className="dashboard-card">
          <div className="panel-heading">
            <p className="eyebrow">Active on platform</p>
            <h2>Approved profiles</h2>
          </div>
          {approved.length ? (
            <div className="simple-list">
              {approved.map(p => <ProfileRow key={p._id} profile={p} approve={approve} />)}
            </div>
          ) : (
            <Empty text="No approved profiles yet." />
          )}
        </article>
      )}
    </div>
  );
}

function ProfileRow({ profile, approve }) {
  return (
    <div className="admin-row">
      <div>
        <strong>{profile.businessName}</strong>
        <small>{profile.user?.name || 'Owner'} · {profile.skillCategory} · {profile.location}</small>
      </div>
      <div className="row-actions">
        <span className={`status ${profile.isApproved ? 'status--approved' : 'status--pending'}`}>
          {profile.isApproved ? 'Approved' : 'In review'}
        </span>
        <button
          className={`btn btn-small ${profile.isApproved ? 'btn-ghost' : 'btn-primary'}`}
          onClick={() => approve(profile._id, !profile.isApproved)}
        >
          {profile.isApproved ? 'Move to review' : 'Approve'}
        </button>
      </div>
    </div>
  );
}
