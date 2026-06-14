import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // True while restoring session

  // Restore auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Error restoring auth state:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (loginId, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error(`Server Error: Expected JSON but received ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.message || 'Login failed');
        err.status = res.status;
        err.data = data;
        throw err;
      }
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error(`Server Error: Expected JSON but received ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('The server is waking up — please try again in 30 seconds.');
      }
      throw err;
    }
  }, []);

  const verifyOTP = useCallback(async (userId, otp) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server Error: Expected JSON but received ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const resendOTP = useCallback(async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server Error: Expected JSON but received ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const loginWithOTPRequest = useCallback(async (email) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/otp-login-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP request failed');
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const verifyLoginOTP = useCallback(async (userId, otp) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/otp-login-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const setAuth = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Verify token is still valid on mount (optional background check)
  useEffect(() => {
    if (!token) return;
    const verifyToken = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          // Token expired or invalid
          logout();
        } else {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const userData = await res.json();
            if (userData && userData._id) {
              const normalizedUser = {
                id: userData._id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
                role: userData.role,
                phone: userData.phone || '',
              };
              setUser(normalizedUser);
              localStorage.setItem('user', JSON.stringify(normalizedUser));
            }
          }
        }
      } catch (err) {
        // Network error — keep existing session, don't log out
        console.warn('Could not verify token (server may be offline):', err.message);
      }
    };
    verifyToken();
  }, [token, logout]);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    loginWithOTPRequest,
    verifyLoginOTP,
    verifyOTP,
    resendOTP,
    logout,
    updateUser,
    setAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
