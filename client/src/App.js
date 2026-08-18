import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

import Home from './pages/Home';
import Makers from './pages/Makers';
import MakerDetail from './pages/MakerDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/entrepreneurs" element={<Makers />} />
              <Route path="/entrepreneurs/:id" element={<MakerDetail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            theme="light"
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
