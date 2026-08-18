import React from 'react';
import { useAuth } from '../hooks/useAuth';
import CustomerDashboard from '../components/dashboard/CustomerDashboard';
import EntrepreneurDashboard from '../components/dashboard/EntrepreneurDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import Empty from '../components/common/Empty';

export default function Dashboard() {
  const { auth } = useAuth();

  if (!auth) {
    return (
      <section className="page-section">
        <Empty text="Please sign in to access your dashboard." action="Sign in" to="/auth" />
      </section>
    );
  }

  if (auth.role === 'admin') return <AdminDashboard />;
  if (auth.role === 'entrepreneur') return <EntrepreneurDashboard />;
  return <CustomerDashboard />;
}
