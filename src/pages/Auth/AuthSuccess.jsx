import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();

  useEffect(() => {
    // Extract token from URL query params
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (token) {
      // Fetch user profile using the token, then store via context
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(user => {
        if(user && user._id) {
           const userData = {
             id: user._id, 
             name: user.name, 
             email: user.email, 
             avatar: user.avatar, 
             role: user.role
           };
           setAuth(userData, token);
        }
        navigate('/account');
      })
      .catch(err => {
         console.error("Error fetching profile after oauth", err);
         navigate('/login');
      });

    } else {
      // Redirect to login if no token is found (or on error)
      navigate('/login');
    }
  }, [location, navigate, setAuth]);

  return (
    <div className="container py-12 text-center" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid #e5e7eb',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '1.5rem',
      }} />
      <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Authenticating...</h2>
      <p style={{ color: '#64748b' }}>Please wait while we log you in.</p>
    </div>
  );
};

export default AuthSuccess;
