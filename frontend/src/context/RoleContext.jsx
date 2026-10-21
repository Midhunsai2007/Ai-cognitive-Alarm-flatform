'use client';
import React, { createContext, useContext, useState } from 'react';

const RoleContext = createContext();

// Demo credentials (frontend-only)
export const DEMO_ROLES = {
  coach: { email: 'coach@cogn.ai', password: 'coach123', name: 'Dr. Sarah Chen', role: 'coach', title: 'Wellness Coach' },
  admin:  { email: 'admin@cogn.ai',  password: 'admin123',  name: 'Alex Admin',     role: 'admin',  title: 'Platform Admin'  },
};

const STORAGE_KEY = 'cogn_role_session';

export function RoleProvider({ children }) {
  const [roleUser, setRoleUser] = useState(() => {
    try {
      if (typeof window === 'undefined') return null;
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const checkRoleLogin = (email, password) => {
    const trimmedEmail = email?.trim().toLowerCase();
    if (trimmedEmail === DEMO_ROLES.coach.email && password === DEMO_ROLES.coach.password) {
      const session = { ...DEMO_ROLES.coach };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setRoleUser(session);
      return { role: 'coach', user: session };
    }
    if (trimmedEmail === DEMO_ROLES.admin.email && password === DEMO_ROLES.admin.password) {
      const session = { ...DEMO_ROLES.admin };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setRoleUser(session);
      return { role: 'admin', user: session };
    }
    return null;
  };

  const loginAsCoach = (email, password) => {
    const res = checkRoleLogin(email, password);
    if (res?.role === 'coach') return true;
    throw new Error('Invalid coach credentials. Use coach@cogn.ai / coach123');
  };

  const loginAsAdmin = (email, password) => {
    const res = checkRoleLogin(email, password);
    if (res?.role === 'admin') return true;
    throw new Error('Invalid admin credentials. Use admin@cogn.ai / admin123');
  };

  const logoutRole = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRoleUser(null);
  };

  return (
    <RoleContext.Provider value={{ roleUser, checkRoleLogin, loginAsCoach, loginAsAdmin, logoutRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
