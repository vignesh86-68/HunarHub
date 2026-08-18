import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';
import Empty from '../common/Empty';
import ImageUpload from '../common/ImageUpload';

const CATEGORIES = ['Cobbler', 'Potter', 'Tailor', 'Artisan', 'Small Vendor', 'Other'];

const STATUS_CLASSES = {
  pending: 'status--pending', confirmed: 'status--accepted',
  processing: 'status--accepted', delivered: 'status--approved',
  cancelled: 'status--rejected'
};

export default function EntrepreneurDashboard() {
  const { request, rupees } = useAuth();
  const [data, setData] = useState({ profile: null, products: [], requests: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState(null);

  const [profileForm, setProfileForm] = useState({
    businessName: '', skillCategory: 'Artisan', description: '', experience: '1', location: '', phone: '', profileImage: ''
  });
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: 'Artisan', stock: '1', images: []
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, products, requests, orders] = await Promise.all([
        request('/entrepreneurs/my-profile').catch(() => null),
        request('/entrepreneurs/my-products').catch(() => []),
        request('/service-requests/entrepreneur-requests').catch(() => []),
        request('/orders/entrepreneur').catch(() => [])
      ]);
      setData({ profile, products, requests, orders });
      if (profile) {
        setProfileForm({
          businessName: profile.businessName || '',
          skillCategory: profile.skillCategory || 'Artisan',
          description: profile.description || '',
          experience: String(profile.experience || 1),
          location: profile.location || '',
          phone: profile.phone || '',
          profileImage: profile.profileImage || ''
        });
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { load(); }, [load]);

  const changeProfile = e => setProfileForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const changeProduct = e => setProductForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (data.profile) {
        await request(`/entrepreneurs/${data.profile._id}`, {
          method: 'PUT', body: JSON.stringify(profileForm)
        });
        toast.success('Profile updated!');
      } else {
        await request('/entrepreneurs', {
          method: 'POST', body: JSON.stringify(profileForm)
        });
        toast.success('Profile submitted for approval!');
      }
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProduct) {
        await request(`/products/${editingProduct._id}`, {
          method: 'PUT', body: JSON.stringify(productForm)
        });
        toast.success('Product updated!');
        setEditingProduct(null);
      } else {
        await request('/products', {
          method: 'POST', body: JSON.stringify(productForm)
        });
        toast.success('Product added to your catalog!');
      }
      setProductForm({ name: '', description: '', price: '', category: 'Artisan', stock: '1', images: [] });
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await request(`/products/${id}`, { method: 'DELETE' });
      toast.success('Product deleted.');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateRequest = async (id, status) => {
    try {
      await request(`/service-requests/${id}`, {
        method: 'PUT', body: JSON.stringify({ status })
      });
      toast.success(`Request ${status}.`);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await request(`/orders/${id}`, {
        method: 'PUT', body: JSON.stringify({ status })
      });
      toast.success(`Order marked as ${status}.`);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const startEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, description: p.description,
      price: String(p.price), category: p.category, stock: String(p.stock), images: p.images || []
    });
    setActiveTab('products');
  };

  const pendingOrders = data.orders.filter(o => o.status === 'pending').length;
  const totalEarnings = data.profile?.totalEarnings || 0;

  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <p className="eyebrow">Entrepreneur Studio</p>
        <h1>{data.profile ? `${data.profile.businessName} at a glance.` : 'Set up your storefront.'}</h1>
        <p>{data.profile
          ? `${data.profile.skillCategory} · ${data.profile.location} · ${data.profile.isApproved ? '✅ Approved' : '⏳ Awaiting approval'}`
          : 'Complete your profile to start showing your work to the community.'
        }</p>
      </header>

      {loading ? <Spinner /> : !data.profile ? (
        /* First time — profile setup */
        <article className="dashboard-card">
          <div className="panel-heading">
            <p className="eyebrow">First step</p>
            <h2>Create your maker profile</h2>
          </div>
          <ProfileForm form={profileForm} change={changeProfile} changeImage={(url) => setProfileForm(f => ({ ...f, profileImage: url }))} submit={saveProfile} saving={saving} isNew />
        </article>
      ) : (
        <>
          {/* Metrics */}
          <div className="metric-row">
            {[
              ['Products', data.products.length, 'In your catalog'],
              ['Requests', data.requests.length, 'Customer enquiries'],
              ['New requests', data.requests.filter(r => r.status === 'pending').length, 'Awaiting reply'],
              ['Orders', data.orders.length, `${pendingOrders} pending`],
            ].map(([a, b, c]) => (
              <article className="metric-card" key={a}>
                <span>{a}</span>
                <strong>{b}</strong>
                <small>{c}</small>
              </article>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="dashboard-tabs">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'products', label: `Products (${data.products.length})` },
              { key: 'requests', label: `Requests (${data.requests.length})` },
              { key: 'orders', label: `Orders (${data.orders.length})` },
              { key: 'profile', label: 'Edit Profile' },
            ].map(t => (
              <button
                key={t.key}
                className={`dash-tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >{t.label}</button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="dashboard-grid">
              <article className="dashboard-card">
                <div className="panel-heading">
                  <p className="eyebrow">Earnings</p>
                  <h2>Total revenue</h2>
                </div>
                <div style={{ padding: '12px 0' }}>
                  <div style={{ fontSize: '42px', fontFamily: 'Georgia,serif', color: 'var(--green)', letterSpacing: '-0.04em' }}>
                    {rupees(totalEarnings)}
                  </div>
                  <small style={{ color: 'var(--muted)' }}>From {data.orders.filter(o => o.status === 'delivered').length} delivered orders</small>
                </div>
              </article>
              <article className="dashboard-card">
                <div className="panel-heading">
                  <p className="eyebrow">Recent customer requests</p>
                  <h2>Enquiries</h2>
                </div>
                {data.requests.length ? (
                  <div className="simple-list">
                    {data.requests.slice(0, 4).map(r => (
                      <div className="request-row" key={r._id}>
                        <div>
                          <strong>{r.customer?.name || 'Customer'}</strong>
                          <small style={{ display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.description}
                          </small>
                        </div>
                        <div className="row-actions">
                          <span className={`status ${r.status === 'pending' ? 'status--pending' : r.status === 'accepted' ? 'status--accepted' : 'status--rejected'}`}>
                            {r.status}
                          </span>
                          {r.status === 'pending' && (
                            <>
                              <button className="text-button accept" onClick={() => updateRequest(r._id, 'accepted')}>Accept</button>
                              <button className="text-button" onClick={() => updateRequest(r._id, 'rejected')}>Decline</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <Empty text="No requests yet." />}
              </article>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="dashboard-grid">
              <article className="dashboard-card">
                <div className="panel-heading">
                  <p className="eyebrow">{editingProduct ? 'Edit product' : 'Add product'}</p>
                  <h2>{editingProduct ? editingProduct.name : 'New product'}</h2>
                </div>
                <form className="form-card" onSubmit={saveProduct}>
                  <ImageUpload
                    label="Product photo"
                    value={productForm.images?.[0] || ''}
                    onChange={(url) => setProductForm(f => ({ ...f, images: [url] }))}
                  />
                  <input name="name" placeholder="Product name" value={productForm.name} onChange={changeProduct} required />
                  <label>Description<textarea name="description" value={productForm.description} onChange={changeProduct} required /></label>
                  <div className="form-split">
                    <label>Price (₹)<input type="number" min="1" name="price" value={productForm.price} onChange={changeProduct} required /></label>
                    <label>Stock<input type="number" min="0" name="stock" value={productForm.stock} onChange={changeProduct} required /></label>
                  </div>
                  <label>Category
                    <select name="category" value={productForm.category} onChange={changeProduct}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <div className="modal-actions">
                    {editingProduct && (
                      <button type="button" className="btn btn-ghost" onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: '', category: 'Artisan', stock: '1', images: [] }); }}>
                        Cancel edit
                      </button>
                    )}
                    <button className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving…' : editingProduct ? 'Save changes →' : 'Add product →'}
                    </button>
                  </div>
                </form>
              </article>

              <article className="dashboard-card">
                <div className="panel-heading">
                  <p className="eyebrow">Your catalog</p>
                  <h2>{data.products.length} products</h2>
                </div>
                {data.products.length ? (
                  <div className="simple-list">
                    {data.products.map(p => (
                      <div className="simple-row" key={p._id}>
                        <div>
                          <strong>{p.name}</strong>
                          <small>{p.category} · {p.stock} in stock · {rupees(p.price)}</small>
                        </div>
                        <div className="row-actions">
                          <button className="btn btn-small btn-ghost" onClick={() => startEditProduct(p)}>Edit</button>
                          <button className="btn btn-small" style={{ color: '#a23f3f', background: '#fae5e3', border: 'none' }} onClick={() => deleteProduct(p._id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <Empty text="No products yet. Add your first product above." />}
              </article>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <article className="dashboard-card">
              <div className="panel-heading">
                <p className="eyebrow">Customer requests</p>
                <h2>All enquiries</h2>
              </div>
              {data.requests.length ? (
                <div className="simple-list">
                  {data.requests.map(r => (
                    <div className="request-row" key={r._id} style={{ alignItems: 'flex-start' }}>
                      <div>
                        <strong>{r.customer?.name || 'Customer'}</strong>
                        <small style={{ display: 'block', color: 'var(--muted)', marginTop: 4 }}>{r.description}</small>
                        {r.address && <small>📍 {r.address}</small>}
                        {r.budget > 0 && <small> · Budget: {rupees(r.budget)}</small>}
                        {r.preferredDate && <small> · Date: {new Date(r.preferredDate).toLocaleDateString('en-IN')}</small>}
                      </div>
                      <div className="row-actions">
                        <span className={`status ${r.status === 'pending' ? 'status--pending' : r.status === 'accepted' ? 'status--accepted' : r.status === 'completed' ? 'status--approved' : 'status--rejected'}`}>
                          {r.status}
                        </span>
                        {r.status === 'pending' && (
                          <>
                            <button className="text-button accept" onClick={() => updateRequest(r._id, 'accepted')}>Accept</button>
                            <button className="text-button" onClick={() => updateRequest(r._id, 'rejected')}>Decline</button>
                          </>
                        )}
                        {r.status === 'accepted' && (
                          <button className="text-button accept" onClick={() => updateRequest(r._id, 'completed')}>Mark complete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <Empty text="No customer requests yet." />}
            </article>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <article className="dashboard-card">
              <div className="panel-heading">
                <p className="eyebrow">Product orders</p>
                <h2>Customer orders</h2>
              </div>
              {data.orders.length ? (
                <div className="simple-list">
                  {data.orders.map(o => (
                    <div className="request-row" key={o._id} style={{ alignItems: 'flex-start' }}>
                      <div>
                        <strong>{o.product?.name || 'Product'}</strong>
                        <small style={{ display: 'block', marginTop: 4 }}>
                          {o.customer?.name} · Qty {o.quantity} · {rupees(o.totalPrice)}
                        </small>
                        <small>📍 {o.deliveryAddress}</small>
                      </div>
                      <div className="row-actions">
                        <span className={`status ${STATUS_CLASSES[o.status] || ''}`}>{o.status}</span>
                        {o.status === 'pending' && (
                          <button className="btn btn-small btn-ghost" onClick={() => updateOrderStatus(o._id, 'confirmed')}>Confirm</button>
                        )}
                        {o.status === 'confirmed' && (
                          <button className="btn btn-small btn-ghost" onClick={() => updateOrderStatus(o._id, 'processing')}>Processing</button>
                        )}
                        {o.status === 'processing' && (
                          <button className="btn btn-small btn-primary" onClick={() => updateOrderStatus(o._id, 'delivered')}>Mark Delivered</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <Empty text="No orders received yet." />}
            </article>
          )}

          {/* Profile Edit Tab */}
          {activeTab === 'profile' && (
            <article className="dashboard-card">
              <div className="panel-heading">
                <p className="eyebrow">Your profile</p>
                <h2>Edit business info</h2>
              </div>
              <ProfileForm form={profileForm} change={changeProfile} changeImage={(url) => setProfileForm(f => ({ ...f, profileImage: url }))} submit={saveProfile} saving={saving} isNew={false} />
            </article>
          )}
        </>
      )}
    </div>
  );
}

function ProfileForm({ form, change, submit, saving, isNew, changeImage }) {
  return (
    <form className="form-card" onSubmit={submit}>
      <ImageUpload label="Profile photo" value={form.profileImage} onChange={changeImage} />
      <div className="form-split">
        <label>Business name <input name="businessName" value={form.businessName} onChange={change} required /></label>
        <label>Craft category
          <select name="skillCategory" value={form.skillCategory} onChange={change}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <label>Tell customers about your work
        <textarea name="description" value={form.description} onChange={change} required />
      </label>
      <div className="form-split">
        <label>Experience (years) <input type="number" min="0" name="experience" value={form.experience} onChange={change} required /></label>
        <label>Location <input name="location" value={form.location} onChange={change} required /></label>
      </div>
      <label>Phone <input name="phone" value={form.phone} onChange={change} required /></label>
      <button className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving…' : isNew ? 'Create profile →' : 'Save changes →'}
      </button>
    </form>
  );
}
