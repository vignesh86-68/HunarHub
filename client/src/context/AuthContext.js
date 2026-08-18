import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';
const KEY = 'hunarhub-auth';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(KEY);
    }
  }, [auth]);

  const request = async (path, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    };

    if (auth?.token) {
      headers['Authorization'] = `Bearer ${auth.token}`;
    }

    const response = await fetch(`${API}${path}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  };

  const login = async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuth(data);
    return data;
  };

  const register = async (userData) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    setAuth(data);
    return data;
  };

  const logout = () => {
    setAuth(null);
  };

  const rupees = (n) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(n || 0);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, register, logout, request, rupees }}>
      {children}
    </AuthContext.Provider>
  );
};
