import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Globe,
  Truck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    login, 
    register, 
    verifyOTP, 
    resendOTP, 
    loginWithOTPRequest,
    verifyLoginOTP,
    isAuthenticated, 
    loading: authLoading 
  } = useAuth();

  // Determine initial mode from URL
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [userId, setUserId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    loginId: '', // Can be email or phone
    otp: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/account');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleModeSwitch = (mode) => {
    setIsLogin(mode === 'login');
    setIsOtpMode(false);
    setError('');
    setSuccess('');
    navigate(mode === 'login' ? '/login' : '/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        if (loginMethod === 'otp') {
          // OTP Login Request
          const res = await loginWithOTPRequest(formData.loginId);
          setUserId(res.userId);
          setIsOtpMode(true);
        } else {
          // Standard Password Login
          const res = await login(formData.loginId, formData.password);
          if (res.status === 403 && res.data.userId) {
            setUserId(res.data.userId);
            setIsOtpMode(true);
          }
        }
      } else {
        // Register Logic
        const res = await register(formData.name, formData.email, formData.password, formData.phone);
        setUserId(res.userId);
        setIsOtpMode(true);
      }
    } catch (err) {
      if (err.status === 403 && err.data && err.data.userId) {
        setUserId(err.data.userId);
        setIsOtpMode(true);
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin && loginMethod === 'otp') {
        await verifyLoginOTP(userId, formData.otp);
      } else {
        await verifyOTP(userId, formData.otp);
      }
      navigate('/account');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await resendOTP(userId);
      setSuccess('A new code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/login_social`;
  };

  return (
    <div className="auth-page-wrapper">
      {/* Breadcrumbs */}
      <div className="auth-breadcrumb-container">
        <nav className="auth-breadcrumbs">
          <span className="breadcrumb-item" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-item active">{isLogin ? 'Sign In' : 'Create Account'}</span>
        </nav>
      </div>

      <div className="auth-container">
        {/* Left Panel: Hero & Trust */}
        <div className="auth-left">
          <img 
            src="/auth_hero_professional_1778584334954.png" 
            alt="Professional Electrical Components" 
            className="auth-hero-img" 
          />
          <div className="auth-overlay"></div>
          
          <div className="auth-left-content">
            <div className="auth-logo">
              <div className="bolt-icon-bg">
                <Zap className="text-white" size={24} fill="white" />
              </div>
              <h2>ELECTRICMART</h2>
            </div>

            <div className="auth-hero-text">
              <h1>The Professional Choice for Electrical Supply.</h1>
              <p>Join thousands of engineers and contractors who trust ElectricMart for quality components and lightning-fast delivery across Nigeria.</p>
            </div>

            <ul className="auth-features">
              <li>
                <div className="check-icon-circle"><ShieldCheck size={18} /></div>
                <span>100% Genuine Certified Products</span>
              </li>
              <li>
                <div className="check-icon-circle"><Truck size={18} /></div>
                <span>Express Site-Delivery (2-24 Hours)</span>
              </li>
              <li>
                <div className="check-icon-circle"><RotateCcw size={18} /></div>
                <span>Bulk Project Discounting Tiers</span>
              </li>
            </ul>

            <div className="auth-trust">
              <Globe size={16} />
              <span>Serving 20+ States in Nigeria</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Forms */}
        <div className="auth-right">
          {!isOtpMode ? (
            <div className="auth-form-content">
              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${isLogin ? 'active' : ''}`}
                  onClick={() => handleModeSwitch('login')}
                >
                  Sign In
                </button>
                <button 
                  className={`auth-tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => handleModeSwitch('register')}
                >
                  Register
                </button>
              </div>

              <h2>{isLogin ? 'Welcome Back' : 'Create Professional Account'}</h2>
              <p className="auth-subtitle">
                {isLogin 
                  ? 'Access your orders, quotes, and saved projects.' 
                  : 'Get started with Nigeria’s leading electrical marketplace.'}
              </p>

              {error && <div className="error-alert" style={{color: '#ef4444', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500'}}>{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-with-icon">
                      <User className="input-icon" size={20} />
                      <input 
                        type="text" 
                        name="name"
                        placeholder="John Doe" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>{isLogin ? 'Email or Phone Number' : 'Email Address'}</label>
                  <div className="input-with-icon">
                    {isLogin ? <Globe className="input-icon" size={20} /> : <Mail className="input-icon" size={20} />}
                    <input 
                      type={isLogin ? "text" : "email"}
                      name={isLogin ? "loginId" : "email"}
                      placeholder={isLogin ? "email@example.com or 080..." : "email@example.com"} 
                      value={isLogin ? formData.loginId : formData.email}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="login-method-toggle" style={{marginBottom: '1rem'}}>
                    <button 
                      type="button" 
                      onClick={() => setLoginMethod(loginMethod === 'password' ? 'otp' : 'password')}
                      style={{background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0}}
                    >
                      {loginMethod === 'password' ? 'Sign in with OTP code instead' : 'Sign in with password instead'}
                    </button>
                  </div>
                )}

                {!isLogin && (
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-with-icon">
                      <Phone className="input-icon" size={20} />
                      <input 
                        type="tel" 
                        name="phone"
                        placeholder="080 000 0000" 
                        value={formData.phone}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                  </div>
                )}

                {(isLogin && loginMethod === 'password' || !isLogin) && (
                  <div className="form-group">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                      <label style={{marginBottom: 0}}>Password</label>
                      {isLogin && <Link to="/forgot-password" title="Coming soon" className="forgot-password">Forgot Password?</Link>}
                    </div>
                    <div className="input-with-icon password-input">
                      <Lock className="input-icon" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        placeholder="••••••••" 
                        value={formData.password}
                        onChange={handleChange}
                        required 
                      />
                      <button 
                        type="button" 
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="form-options">
                    <label className="checkbox-container">
                      <input type="checkbox" defaultChecked />
                      <span>Remember this device</span>
                    </label>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-auth" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (isLogin ? 'Secure Sign In' : 'Create Account')}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>

              <div className="auth-divider">
                <span>OR CONTINUE WITH</span>
              </div>

              <button className="btn-google" onClick={handleGoogleLogin} type="button">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
                Google Workspace
              </button>
            </div>
          ) : (
            /* OTP Verification UI */
            <div className="auth-form-content">
              <h2>Verify Your Identity</h2>
              <p className="auth-subtitle">We've sent a 6-digit verification code to your email. Enter it below to secure your account.</p>

              {error && <div className="error-alert" style={{color: '#ef4444', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500'}}>{error}</div>}
              {success && <div className="success-alert" style={{color: '#059669', background: '#ecfdf5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500'}}>{success}</div>}

              <form onSubmit={handleOtpSubmit}>
                <div className="form-group">
                  <label>Verification Code</label>
                  <div className="input-with-icon">
                    <ShieldCheck className="input-icon" size={20} />
                    <input 
                      type="text" 
                      name="otp"
                      maxLength="6"
                      placeholder="000000" 
                      value={formData.otp}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn-auth" disabled={loading}>
                  {loading ? 'Verifying...' : 'Complete Verification'}
                  <CheckCircle2 size={20} />
                </button>

                <p className="auth-redirect" style={{textAlign: 'center', marginTop: '2rem', color: '#64748b'}}>
                  Didn't receive a code? <span 
                    className="register-link" 
                    style={{color: '#2563eb', fontWeight: 600, cursor: 'pointer'}}
                    onClick={handleResendOtp}
                  >Resend OTP</span>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
