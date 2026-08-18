import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const { auth, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'customer', phone: '', location: ''
  });

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      toast.success('Welcome to HunarHub! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (auth) {
    return (
      <section className="auth-layout">
        <div className="auth-aside">
          <p className="eyebrow">You are signed in</p>
          <h1>Your workspace is ready.</h1>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Open dashboard &rarr;
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-layout">
      <div className="auth-aside">
        <p className="eyebrow">HunarHub community</p>
        <h1>Make your work<br /><em>visible.</em></h1>
        <p>Join a marketplace built to help local talent reach the people who value it.</p>
        <div className="auth-quote">The best work deserves to be found.</div>
      </div>

      <div className="auth-card">
        <div className="tabs">
          <button
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => setMode('login')}
          >Sign in</button>
          <button
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => setMode('register')}
          >Create account</button>
        </div>

        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="muted">{mode === 'login' ? 'Enter your details to continue.' : 'Start your HunarHub journey today.'}</p>

        <form className="form-card" onSubmit={submit}>
          {mode === 'register' && (
            <>
              <div className="form-split">
                <Field label="Full name" name="name" value={form.name} onChange={change} required />
                <Field label="Phone" name="phone" value={form.phone} onChange={change} />
              </div>
              <div className="form-split">
                <Field label="Location / City" name="location" value={form.location} onChange={change} />
                <label>
                  How will you use HunarHub?
                  <select name="role" value={form.role} onChange={change}>
                    <option value="customer">I am a customer</option>
                    <option value="entrepreneur">I am an entrepreneur</option>
                  </select>
                </label>
              </div>
            </>
          )}
          <Field label="Email address" name="email" type="email" value={form.email} onChange={change} required />
          <Field label="Password" name="password" type="password" minLength={6} value={form.password} onChange={change} required />
          <button className="btn btn-primary btn-full" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}
