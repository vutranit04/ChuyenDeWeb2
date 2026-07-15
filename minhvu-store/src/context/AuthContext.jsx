import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('minhvu-customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (customer) {
      localStorage.setItem('minhvu-customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('minhvu-customer');
    }
  }, [customer]);

  const login = (customerData) => {
    setCustomer(customerData);
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('minhvu-customer');
  };

  const isAuthenticated = !!customer;

  return (
    <AuthContext.Provider value={{ customer, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
