import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-stack">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">India's local talent, online</p>
          <h1>Every craft has a story. <em>Help it grow.</em></h1>
          <p className="lead">
            Discover exceptional local makers, order handcrafted goods, and connect directly
            for services that matter.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/entrepreneurs">Explore makers &rarr;</Link>
            <Link className="btn btn-ghost" to="/auth">Join HunarHub</Link>
          </div>
          <div className="trust-row">
            <span>✓ Verified local businesses</span>
            <span>✓ Direct connections</span>
            <span>✓ Authentic handcraft</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <div className="craft-card craft-card--main">
            <span className="craft-icon">🧵</span>
            <p>Made with care</p>
            <strong>One marketplace.<br />Endless skill.</strong>
          </div>
          <div className="floating-stat">
            <strong>250+</strong>
            <span>Local makers</span>
          </div>
          <div className="floating-rating">
            ★ <strong>4.9</strong>
            <span>community rating</span>
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section className="value-strip">
        {[
          ['01', 'Discover', 'Find skilled makers near you.'],
          ['02', 'Connect', 'Request a service with confidence.'],
          ['03', 'Grow', 'Build a business customers trust.'],
        ].map(([n, h, p]) => (
          <div key={n}>
            <span>{n}</span>
            <h3>{h}</h3>
            <p>{p}</p>
          </div>
        ))}
      </section>

      <section className="section-intro">
        <p className="eyebrow">Built for the whole community</p>
        <h2>One place, three powerful experiences.</h2>
      </section>

      {/* Feature grid */}
      <section className="feature-grid">
        <FeatureCard
          icon="🛍️"
          title="For customers"
          text="Browse trusted work, place orders, and follow every request from one calm workspace."
        />
        <FeatureCard
          icon="🔨"
          title="For entrepreneurs"
          text="Create your storefront, manage products, and respond to real customer opportunities."
        />
        <FeatureCard
          icon="🏛️"
          title="For administrators"
          text="Review profiles, see marketplace health, and keep the community safe and active."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <article className="feature-card">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to="/auth">Get started &rarr;</Link>
    </article>
  );
}
