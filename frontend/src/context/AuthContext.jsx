'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const profile = await userAPI.getProfile();
      setUser(profile);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      // Clear invalid token
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = getAuthToken();
    if (stored) {
      setToken(stored);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const signup = async (name, email, password) => {
    const res = await authAPI.signup(name, email, password);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (name, email, avatar) => {
    const updated = await userAPI.updateProfile(name, email, avatar);
    setUser(updated);
    return updated;
  };

  const resetUserStats = async () => {
    await userAPI.resetStats();
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updateUserProfile,
        resetUserStats,
        refreshProfile: fetchProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
