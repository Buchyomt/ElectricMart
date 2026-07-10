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
import { motion, AnimatePresence } from 'framer-motion';
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
    isAuthenticated 
  } = useAuth();

  // Determine initial mode from URL
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [userId, setUserId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
          const res = await loginWithOTPRequest(formData.loginId);
          setUserId(res.userId);
          setIsOtpMode(true);
        } else {
          const res = await login(formData.loginId, formData.password);
          if (res.status === 403 && res.data.userId) {
            setUserId(res.data.userId);
            setIsOtpMode(true);
          }
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
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
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5005' : '');
    window.location.href = `${apiUrl}/api/auth/login_social`;
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20 }
  };

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? -20 : 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
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

      <motion.div 
        className="auth-container"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
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
                  {isLogin && <motion.div layoutId="tab-indicator" className="tab-indicator" />}
                </button>
                <button 
                  className={`auth-tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => handleModeSwitch('register')}
                >
                  Register
                  {!isLogin && <motion.div layoutId="tab-indicator" className="tab-indicator" />}
                </button>
              </div>

              <motion.div 
                key={isLogin ? 'login' : 'register'}
                variants={formVariants}
                initial="hidden"
                animate="visible"
              >
                <h2>{isLogin ? 'Welcome Back' : 'Create Professional Account'}</h2>
                <p className="auth-subtitle">
                  {isLogin 
                    ? 'Access your orders, quotes, and saved projects.' 
                    : 'Get started with Nigeria’s leading electrical marketplace.'}
                </p>

                {error && <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="error-alert">{error}</motion.div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                  <AnimatePresence mode='wait'>
                    {!isLogin && (
                      <motion.div 
                        key="register-fields-top"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="floating-label-group">
                          <User className="input-icon" size={20} />
                          <input 
                            type="text" 
                            name="name"
                            placeholder=" "
                            value={formData.name}
                            onChange={handleChange}
                            required 
                          />
                          <label>Full Name</label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="floating-label-group">
                    {isLogin ? <Globe className="input-icon" size={20} /> : <Mail className="input-icon" size={20} />}
                    <input 
                      type={isLogin ? "text" : "email"}
                      name={isLogin ? "loginId" : "email"}
                      placeholder=" "
                      value={isLogin ? formData.loginId : formData.email}
                      onChange={handleChange}
                      required 
                    />
                    <label>{isLogin ? 'Email or Phone Number' : 'Email Address'}</label>
                  </div>

                  <AnimatePresence mode='wait'>
                    {isLogin && (
                      <motion.div className="login-method-toggle" initial={{opacity:0}} animate={{opacity:1}}>
                        <button 
                          type="button" 
                          onClick={() => setLoginMethod(loginMethod === 'password' ? 'otp' : 'password')}
                        >
                          {loginMethod === 'password' ? 'Sign in with OTP code instead' : 'Sign in with password instead'}
                        </button>
                      </motion.div>
                    )}

                    {!isLogin && (
                      <motion.div 
                        key="register-fields-mid"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="floating-label-group">
                          <Phone className="input-icon" size={20} />
                          <input 
                            type="tel" 
                            name="phone"
                            placeholder=" "
                            value={formData.phone}
                            onChange={handleChange}
                            required 
                          />
                          <label>Phone Number</label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode='wait'>
                    {(isLogin && loginMethod === 'password' || !isLogin) && (
                      <motion.div 
                        key="password-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="floating-label-group password-group"
                      >
                        <Lock className="input-icon" size={20} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          name="password"
                          placeholder=" "
                          value={formData.password}
                          onChange={handleChange}
                          required 
                        />
                        <label>Password</label>
                        <button 
                          type="button" 
                          className="toggle-password"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </motion.div>
                    )}
                    
                    {!isLogin && (
                      <motion.div 
                        key="confirm-password-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="floating-label-group password-group"
                      >
                        <Lock className="input-icon" size={20} />
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          name="confirmPassword"
                          placeholder=" "
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required 
                        />
                        <label>Confirm Password</label>
                        <button 
                          type="button" 
                          className="toggle-password"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex="-1"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isLogin && loginMethod === 'password' && (
                    <div className="form-options">
                      <label className="checkbox-container">
                        <input type="checkbox" defaultChecked />
                        <span>Remember this device</span>
                      </label>
                      <Link to="/forgot-password" title="Coming soon" className="forgot-password">Forgot Password?</Link>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="btn-auth" 
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Secure Sign In' : 'Create Account')}
                    {!loading && <ArrowRight size={20} />}
                  </motion.button>
                </form>

                <div className="auth-divider">
                  <span>OR CONTINUE WITH</span>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-google" 
                  onClick={handleGoogleLogin} 
                  type="button"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
                  Google Workspace
                </motion.button>
              </motion.div>
            </div>
          ) : (
            /* OTP Verification UI */
            <motion.div 
              className="auth-form-content"
              initial={{opacity: 0, scale: 0.95}}
              animate={{opacity: 1, scale: 1}}
            >
              <h2>Verify Your Identity</h2>
              <p className="auth-subtitle">We've sent a 6-digit verification code to your email. Enter it below to secure your account.</p>

              {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="error-alert">{error}</motion.div>}
              {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="success-alert">{success}</motion.div>}

              <form onSubmit={handleOtpSubmit}>
                <div className="floating-label-group">
                  <ShieldCheck className="input-icon" size={20} />
                  <input 
                    type="text" 
                    name="otp"
                    maxLength="6"
                    placeholder=" "
                    value={formData.otp}
                    onChange={handleChange}
                    required 
                  />
                  <label>Verification Code</label>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="btn-auth" 
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Complete Verification'}
                  <CheckCircle2 size={20} />
                </motion.button>

                <p className="auth-redirect" style={{textAlign: 'center', marginTop: '2rem', color: '#64748b'}}>
                  Didn't receive a code? <span 
                    className="register-link" 
                    style={{color: '#2563eb', fontWeight: 600, cursor: 'pointer'}}
                    onClick={handleResendOtp}
                  >Resend OTP</span>
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
