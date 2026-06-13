import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Heart, 
  Bell, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Plus, 
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  Truck, 
  Warehouse,
  ChevronRight,
  RefreshCcw,
  MapPin,
  Search,
  Key,
  ShoppingCart,
  Eye,
  X,
  Upload,
  Laptop,
  Send,
  Tag,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token, updateUser } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || 'dashboard';
  });
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notification, setNotification] = useState(null); // { message, type }

  // Support Tickets
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [newTicketForm, setNewTicketForm] = useState({ subject: '', category: 'general', priority: 'medium', message: '' });
  const [replyText, setReplyText] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setNotification({
        message: location.state.successMessage,
        type: 'success'
      });
      // Clear location state in history so reloading doesn't show it again
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    const fetchProjects = async () => {
      if (!token || !user) return;
      setLoadingProjects(true);
      try {
        const res = await fetch('/api/projects', {
          headers: { 'userid': user.id || user._id }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error('Projects fetch error', err);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchOrders();
    fetchProjects();
  }, [token, user]);

  // --- Scroll Locking Logic ---
  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedOrder]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, phone: profilePhone })
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ name: data.name, phone: data.phone });
        setNotification({ message: 'Your personal profile details have been updated successfully!', type: 'success' });
      } else {
        setNotification({ message: data.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'An error occurred while updating profile.', type: 'error' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setNotification({ message: 'Please enter a valid new password.', type: 'error' });
      return;
    }
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ message: 'Your security password has been changed successfully!', type: 'success' });
        setNewPassword('');
      } else {
        setNotification({ message: data.message || 'Failed to update password.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'An error occurred while updating password.', type: 'error' });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ avatar: data.avatar });
        setNotification({ message: 'Avatar updated successfully!', type: 'success' });
      } else {
        setNotification({ message: data.message || 'Failed to upload avatar.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'An error occurred during upload.', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Fetch tickets when support tab opens
  useEffect(() => {
    if (activeTab === 'support') {
      setLoadingTickets(true);
      fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(data => { setTickets(Array.isArray(data) ? data : []); setLoadingTickets(false); })
        .catch(() => setLoadingTickets(false));
    }
  }, [activeTab, token]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTicketForm)
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(prev => [data, ...prev]);
        setActiveTicket(data);
        setShowNewTicket(false);
        setNewTicketForm({ subject: '', category: 'general', priority: 'medium', message: '' });
      }
    } catch (err) { console.error(err); }
  };

  const handleTicketReply = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: replyText })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveTicket(data);
        setTickets(prev => prev.map(t => t._id === data._id ? data : t));
        setReplyText('');
      }
    } catch (err) { console.error(err); }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return '₦' + (amount || 0).toLocaleString();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Sidebar Nav Items (Matching the image layout)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
    { id: 'projects', label: 'Project Lists', icon: <ClipboardList size={20} /> },
    { id: 'saved', label: 'Saved Items', icon: <Heart size={20} /> },
    { id: 'alerts', label: 'Price Alerts', icon: <Bell size={20} /> },
    { id: 'support', label: 'Support Chat', icon: <MessageCircle size={20} /> },
    { id: 'settings', label: 'Account Settings', icon: <Settings size={20} /> },
  ];

  // --- Render Functions for Tabs ---

  const renderDashboardOverview = () => (
    <div className="tab-view">
      {/* Header Section */}
      <div className="db-welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p>You have <span className="highlight">{orders.filter(o => o.orderStatus !== 'delivered').length} active orders</span> and <span className="highlight">1 pending quote</span>.</p>
        </div>
        <button className="btn btn-primary btn-new-project" onClick={() => navigate('/quote')}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {[
          { label: 'Total Orders', value: orders.length.toString(), icon: <Package />, hasTrend: true },
          { label: 'Active Projects', value: '3', icon: <ClipboardList />, hasTrend: true },
          { label: 'Saved Items', value: wishlist.length.toString(), icon: <Heart /> },
          { label: 'Pending Quotes', value: '1', icon: <Package />, isNew: true },
        ].map((stat, i) => (
          <div key={i} className="stat-card" onClick={() => stat.label.includes('Orders') ? setActiveTab('orders') : stat.label.includes('Saved') ? setActiveTab('saved') : stat.label.includes('Projects') ? setActiveTab('projects') : null}>
            <div className="stat-top">
              <div className="stat-icon-wrapper">{stat.icon}</div>
              {stat.isNew && <span className="new-tag">New</span>}
            </div>
            <div className="stat-bottom">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Orders Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Active Orders</h2>
          <button className="view-all-btn" onClick={() => setActiveTab('orders')}>View all <ChevronRight size={16} /></button>
        </div>
        <div className="active-orders-grid">
          {orders.filter(o => o.orderStatus !== 'delivered').slice(0, 2).map(order => (
            <div key={order._id} className="order-card-wide">
              <div className="order-col">
                <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                <span className="order-date">Placed {formatDate(order.createdAt)}</span>
                <div style={{ marginTop: '0.5rem' }}>
                  <span className={`status-pill ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div className="order-col">
                <div className="order-items-mini">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="mini-item">
                      <img src={item.image ? `/${item.image}` : '/placeholder.png'} alt={item.name} />
                      <div><strong>{item.name}</strong><span>Qty: {item.quantity}</span></div>
                    </div>
                  ))}
                  {order.items.length > 2 && <div className="more-items-text">+{order.items.length - 2}</div>}
                </div>
              </div>
              <div className="order-col order-totals">
                <div className="total-label">Total Amount</div>
                <div className="total-value">{formatCurrency(order.total)}</div>
              </div>
            </div>
          ))}
          {orders.filter(o => o.orderStatus !== 'delivered').length === 0 && (
            <div className="db-table-card" style={{padding: '40px', textAlign: 'center'}}>
              <p style={{color: '#64748b', marginBottom: '1rem'}}>No active orders at the moment.</p>
              <button className="btn btn-primary" onClick={() => navigate('/shop')}>Start Shopping</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  const renderOrders = () => {
    const filtered = orders.filter(o => 
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="tab-view">
        <div className="section-header">
          <h2>Order History & Tracking</h2>
          <div className="search-box-db">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or item..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Order Cards with Tracking Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filtered.map(order => {
            const steps = ['confirmed', 'packed', 'shipping', 'delivered'];
            const currentIdx = steps.indexOf(order.orderStatus);
            return (
              <div key={order._id} className="order-card-wide" style={{ display: 'block', padding: '2rem' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>Order #{order._id.slice(-6).toUpperCase()}</h3>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Placed on {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#3b82f6' }}>{formatCurrency(order.total)}</span>
                    <span className={`status-pill ${order.orderStatus === 'cancelled' ? 'cancelled' : order.orderStatus === 'delivered' ? 'delivered' : 'shipping'}`}>{order.orderStatus}</span>
                    <button className="view-all-btn" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.75rem' }} onClick={() => setSelectedOrder(order)}><Eye size={14} /> Details</button>
                  </div>
                </div>

                {/* Tracking Timeline */}
                {order.orderStatus !== 'cancelled' && (
                  <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    {steps.map((step, idx) => {
                      const done = idx <= currentIdx;
                      const active = idx === currentIdx;
                      return (
                        <React.Fragment key={step}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 'none' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? (active ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#10b981') : 'rgba(241,245,249,0.8)', border: done ? 'none' : '2px solid #e2e8f0', boxShadow: active ? '0 0 0 6px rgba(59,130,246,0.15)' : 'none', transition: 'all 0.3s' }}>
                              {done && !active ? <CheckCircle size={18} color="white" /> : active ? (step === 'confirmed' ? <CheckCircle size={18} color="white" /> : step === 'packed' ? <Package size={18} color="white" /> : step === 'shipping' ? <Truck size={18} color="white" /> : <MapPin size={18} color="white" />) : <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1' }} />}
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: active ? '800' : '600', color: done ? (active ? '#3b82f6' : '#10b981') : '#94a3b8', textTransform: 'capitalize', letterSpacing: '0.5px' }}>{step}</span>
                          </div>
                          {idx < steps.length - 1 && (
                            <div style={{ flex: 1, height: '3px', background: idx < currentIdx ? 'linear-gradient(90deg, #10b981, #10b981)' : '#e2e8f0', margin: '0 0.5rem', marginBottom: '1.5rem', borderRadius: '4px', transition: 'background 0.3s' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* Items Strip */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(248,250,252,0.8)', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(226,232,240,0.6)', fontSize: '0.8rem' }}>
                      <img src={item.image ? `/${item.image}` : '/placeholder.png'} alt={item.name} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: '600', color: '#374151' }}>{item.name}</span>
                      <span style={{ color: '#6b7280' }}>× {item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 4 && <span style={{ padding: '0.5rem 0.75rem', background: 'rgba(59,130,246,0.08)', borderRadius: '10px', fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700' }}>+{order.items.length - 4} more</span>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="db-table-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Package size={40} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
              <p style={{ color: '#64748b' }}>{orders.length === 0 ? "You haven't placed any orders yet." : "No orders match your search."}</p>
              {orders.length === 0 && <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/shop')}>Start Shopping</button>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="tab-view">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Account Settings</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>Manage your B2B profile and security preferences.</p>
      </div>
      <div className="settings-split">
        <div className="settings-main-card animate-fade-in">
          <div className="settings-cover-photo"></div>
          
          <div className="settings-main-card-inner">
            <div className="avatar-upload-section" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', gap: '2rem', marginBottom: '2.5rem', marginTop: '-3rem' }}>
              <div className="profile-img" style={{ width: '120px', height: '120px', margin: 0, border: '5px solid white', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)' }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || 'User'} />
                ) : (
                  <div className="profile-initials" style={{ fontSize: '2.5rem' }}>{getInitials(user?.name)}</div>
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#0f172a' }}>{user?.name || 'B2B Client'}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Enterprise Customer</p>
                <label style={{ 
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                  padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)', transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <Upload size={16} /> {uploadingAvatar ? 'Uploading...' : 'Update Avatar'}
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
              </div>
            </div>

            <div className="profile-completion-widget">
              <div className="completion-circle">
                <span className="completion-text">85%</span>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>Profile Completion</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Complete your profile to unlock premium B2B tier pricing.</p>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter your full name"]');
                  if (input) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => input.focus(), 500);
                  } else {
                    setNotification({ type: 'success', message: 'Please fill out your Personal Details below.' });
                  }
                }}
              >
                Complete Now
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: 'none' }}>Personal Details</h3>
            <form className="settings-form-db" onSubmit={handleUpdateProfile}>
              <div className="form-row-db">
                <div className="form-group-db">
                  <label>Full Name</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} required placeholder="Enter your full name" />
                </div>
                <div className="form-group-db">
                  <label>Email Address</label>
                  <input type="email" value={user?.email || ''} disabled style={{ backgroundColor: 'rgba(241, 245, 249, 0.8)', cursor: 'not-allowed', color: '#64748b' }} />
                </div>
              </div>
              <div className="form-row-db">
                <div className="form-group-db">
                  <label>Phone Number</label>
                  <input type="text" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} required placeholder="+234 (___) ___-____" />
                </div>
                <div className="form-group-db">
                  <label>Company/Role</label>
                  <input type="text" placeholder="e.g. Procurement Manager" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.85rem 2rem', fontSize: '1rem', width: '100%' }}>Save Profile Changes</button>
            </form>
          </div>
        </div>

        <div className="settings-side-card animate-fade-in" style={{ padding: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#0f172a' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem', borderRadius: '12px', display: 'flex' }}>
              <Key size={20} />
            </div> 
            Security Settings
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            We recommend changing your password regularly to keep your business account secure.
          </p>
          <form className="settings-form-db" onSubmit={handleChangePassword}>
            <div className="form-group-db">
              <label>New Password</label>
              <input type="password" placeholder="Enter robust new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="form-group-db">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm your password" required />
            </div>
            <button type="submit" className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', padding: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}>
              Update Password
            </button>
          </form>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(226, 232, 240, 0.5)' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: '#0f172a' }}>Login History</h4>
            <div className="login-history-item">
              <div>
                <div className="login-device"><Laptop size={16} /> Windows 11 - Chrome</div>
                <div className="login-meta">Lagos, Nigeria • IP: 105.112.x.x</div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>Active Now</span>
            </div>
            <div className="login-history-item">
              <div>
                <div className="login-device"><Laptop size={16} /> Mac OS - Safari</div>
                <div className="login-meta">Abuja, Nigeria • IP: 197.210.x.x</div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => {
    const mockAlerts = [
      { id: 1, product: '6Watts COB Light Yellow', currentPrice: 4200, targetPrice: 3800, type: 'Price Drops Below', status: 'Active' },
      { id: 2, product: 'Schneider 1 Gang Switch', currentPrice: 1800, targetPrice: 1500, type: 'Price Drops Below', status: 'Triggered' },
      { id: 3, product: 'Nexans 1.5mm Single Core Cable', currentPrice: 48000, targetPrice: 45000, type: 'Price Drops Below', status: 'Active' },
    ];

    return (
      <div className="tab-view animate-fade-in">
        <div className="section-header">
          <h2>B2B Price Alerts</h2>
          <button className="btn btn-primary btn-sm" onClick={() => alert('Add alert subscription wizard is loading...')}>+ Add Material Alert</button>
        </div>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Subscribe to real-time wholesale price alerts on critical construction materials. We will notify you via email when the price drops below your target.
        </p>
        <div className="db-table-card">
          <table className="db-data-table">
            <thead>
              <tr>
                <th>Material / Product</th>
                <th>Current Wholesale</th>
                <th>Target Alert Price</th>
                <th>Notification Rule</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockAlerts.map(alert => (
                <tr key={alert.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="stat-icon-wrapper" style={{ width: '32px', height: '32px', margin: 0, background: '#eff6ff', color: '#2563eb' }}>
                        <Bell size={14} />
                      </div>
                      <strong>{alert.product}</strong>
                    </div>
                  </td>
                  <td className="font-bold">₦{alert.currentPrice.toLocaleString()}</td>
                  <td className="highlight font-bold">₦{alert.targetPrice.toLocaleString()}</td>
                  <td><span className="id-tag">{alert.type}</span></td>
                  <td>
                    <span className={`status-pill ${alert.status === 'Active' ? 'shipping' : 'delivered'}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="view-all-btn" style={{ color: '#ef4444', marginLeft: 'auto' }} onClick={() => alert('Alert subscription removed.')}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return renderDashboardOverview();
      case 'orders': return renderOrders();
      case 'settings': return renderSettings();
      case 'alerts': return renderAlerts();
      case 'projects': return (
          <div className="tab-view">
            <div className="section-header">
              <h2>My Site Projects</h2>
              <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/quote')}>+ New Project</button>
            </div>
            <div className="db-table-card">
              <table className="db-data-table">
                <thead>
                  <tr><th>Project Name</th><th>Location</th><th>Status</th><th>Items</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p._id}>
                      <td className="font-bold">{p.name}</td>
                      <td>{p.location}</td>
                      <td><span className={`status-pill ${p.status?.toLowerCase().replace(' ', '-') || 'pending'}`}>{p.status || 'Active'}</span></td>
                      <td>{p.items?.length || 0}</td>
                      <td className="font-bold">₦{(p.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {projects.length === 0 && !loadingProjects && (
                    <tr><td colSpan="5" className="text-center py-10">No saved projects found. Try saving a project list!</td></tr>
                  )}
                  {loadingProjects && (
                    <tr><td colSpan="5" className="text-center py-10">Loading project data...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'saved': return (
        <div className="tab-view">
          <div className="section-header"><h2>Saved Items</h2></div>
          <div className="db-table-card">
            <table className="db-data-table saved-items-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map(product => (
                  <tr key={product._id} className="saved-item-row">
                    <td className="db-product-cell">
                      <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                        <div className="saved-item-img-wrap">
                          <img src={product.image?.startsWith('http') ? product.image : `/${product.image}`} alt={product.name} />
                        </div>
                        <div className="saved-item-info-stack">
                          <span className="brand-tag">{product.brand}</span>
                          <strong className="product-title">{product.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td className="font-bold price-cell">{formatCurrency(product.price)}</td>
                    <td>
                      <div className="db-actions-cell" style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/product/${product._id}`)}>View Details</button>
                        <button className="btn-icon-danger" onClick={() => toggleWishlist(product._id)} title="Remove from Saved">
                          <Heart size={18} fill="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {wishlist.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{textAlign: 'center', padding: '4rem 2rem'}}>
                      <Heart size={48} style={{ color: '#cbd5e1', marginBottom: '1rem', fill: 'transparent' }} />
                      <h3 style={{ marginBottom: '0.5rem', color: '#0f172a' }}>Your wishlist is empty</h3>
                      <p style={{ color: '#64748b' }}>Start exploring our catalog to save items for later.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
      case 'support': return (
        <div className="tab-view animate-fade-in">
          <div className="section-header">
            <div>
              <h2>Support Centre</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Get help from our B2B support team.</p>
            </div>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowNewTicket(!showNewTicket)}>
              <MessageCircle size={18} /> {showNewTicket ? 'Cancel' : 'Open New Ticket'}
            </button>
          </div>

          {showNewTicket && (
            <div className="db-table-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>New Support Ticket</h3>
              <form onSubmit={handleCreateTicket}>
                <div className="form-row-db">
                  <div className="form-group-db">
                    <label>Subject</label>
                    <input type="text" required placeholder="e.g. Issue with my order #ABC123" value={newTicketForm.subject} onChange={e => setNewTicketForm(p => ({...p, subject: e.target.value}))} />
                  </div>
                  <div className="form-group-db">
                    <label>Category</label>
                    <select style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '1rem' }} value={newTicketForm.category} onChange={e => setNewTicketForm(p => ({...p, category: e.target.value}))}>
                      <option value="order_issue">Order Issue</option>
                      <option value="product_inquiry">Product Inquiry</option>
                      <option value="payment">Payment</option>
                      <option value="returns">Returns & Refunds</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>
                <div className="form-group-db">
                  <label>Message</label>
                  <textarea required rows={4} placeholder="Describe your issue in detail..." value={newTicketForm.message} onChange={e => setNewTicketForm(p => ({...p, message: e.target.value}))} style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '1rem', resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: activeTicket ? '1fr 2fr' : '1fr', gap: '1.5rem' }}>
            {/* Ticket List */}
            <div className="db-table-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontWeight: '700', marginBottom: '1rem', color: '#0f172a' }}>Your Tickets</h4>
              {loadingTickets && <p style={{ color: '#64748b' }}>Loading tickets...</p>}
              {!loadingTickets && tickets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <MessageCircle size={40} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                  <p style={{ color: '#64748b' }}>No tickets yet. Open one above.</p>
                </div>
              )}
              {tickets.map(ticket => (
                <div key={ticket._id} onClick={() => setActiveTicket(ticket)} style={{ padding: '1rem', borderRadius: '12px', cursor: 'pointer', marginBottom: '0.5rem', background: activeTicket?._id === ticket._id ? 'rgba(59,130,246,0.08)' : 'rgba(248,250,252,0.6)', border: `1px solid ${activeTicket?._id === ticket._id ? 'rgba(59,130,246,0.3)' : 'rgba(226,232,240,0.5)'}`, transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{ticket.subject}</strong>
                    <span className={`status-pill ${ticket.status === 'open' ? 'pending' : ticket.status === 'in_progress' ? 'shipping' : 'delivered'}`} style={{ fontSize: '0.65rem' }}>{ticket.status.replace('_', ' ')}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{ticket.messages?.length || 0} message{ticket.messages?.length !== 1 ? 's' : ''} · {formatDate(ticket.updatedAt)}</p>
                </div>
              ))}
            </div>

            {/* Conversation View */}
            {activeTicket && (
              <div className="db-table-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(226,232,240,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: '700', color: '#0f172a', margin: 0 }}>{activeTicket.subject}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{activeTicket.category?.replace('_', ' ')} · Ticket #{activeTicket._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <button onClick={() => setActiveTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeTicket.messages?.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', padding: '0.75rem 1rem', borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.sender === 'user' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(248,250,252,0.9)', color: msg.sender === 'user' ? 'white' : '#0f172a', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{msg.text}</p>
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.7rem', opacity: 0.7 }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(226,232,240,0.5)', display: 'flex', gap: '0.75rem' }}>
                  <input type="text" placeholder="Type your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTicketReply(activeTicket._id)} style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }} />
                  <button onClick={() => handleTicketReply(activeTicket._id)} className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Send size={16} /> Send</button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
      default: return renderDashboardOverview();
    }
  };

  return (
    <div className="dashboard-page">
      {/* Order Details Modal Overlay */}
      {selectedOrder && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Order Details: #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
              <button className="close-modal" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-section">
                  <h4>Delivery Address</h4>
                  <div className="info-box">
                    <p><strong>Recipient:</strong> {selectedOrder.shippingAddress.fullName}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                  </div>
                </div>

                <div className="modal-section">
                  <h4>Order Summary</h4>
                  <div className="info-box">
                    <p><strong>Status:</strong> <span className={`status-pill ${selectedOrder.orderStatus.toLowerCase()}`}>{selectedOrder.orderStatus}</span></p>
                    <p><strong>Placed:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>Payment:</strong> {selectedOrder.paymentStatus.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="modal-section items-section">
                <h4>Material Checklist</h4>
                <table className="modal-items-table">
                  <thead>
                    <tr><th>Material</th><th>Qty</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                          <img src={item.image ? `/${item.image}` : '/placeholder.png'} style={{width: '32px', height: '32px', borderRadius: '4px'}} alt=""/>
                          {item.name}
                        </td>
                        <td>{item.quantity}</td>
                        <td className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-summary">
                <div className="summary-row"><span>Total Amount:</span> <span className="font-bold highlight" style={{fontSize: '1.25rem', color: '#111827'}}>{formatCurrency(selectedOrder.total)}</span></div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedOrder(null)}>Close View</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Profile Update Notification Modal */}
      {notification && createPortal(
        <div className="db-notify-overlay" onClick={() => setNotification(null)}>
          <div className="db-notify-modal" onClick={e => e.stopPropagation()}>
            <div className={`db-notify-icon-wrap ${notification.type}`}>
              {notification.type === 'success'
                ? <CheckCircle size={32} />
                : <AlertCircle size={32} />}
            </div>
            <h3 className="db-notify-title">
              {notification.type === 'success' ? 'Update Successful' : 'Action Failed'}
            </h3>
            <p className="db-notify-msg">{notification.message}</p>
            <button
              className={`btn db-notify-btn ${notification.type === 'success' ? 'btn-primary' : 'btn-danger'}`}
              onClick={() => setNotification(null)}
            >
              {notification.type === 'success' ? 'Got it, thanks!' : 'Dismiss'}
            </button>
          </div>
        </div>,
        document.body
      )}

      <div className="dashboard-container">
        
        {/* Sidebar */}
        <aside className="db-sidebar">
          <div className="db-profile">
            <div className="profile-img">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || 'User'} />
              ) : (
                <div className="profile-initials">{getInitials(user?.name)}</div>
              )}
            </div>
            <h3>{user?.name || 'User'}</h3>
            <div className="badge-verified"><CheckCircle2 size={12} /> {user?.role === 'admin' ? 'Administrator' : 'Verified Customer'}</div>
          </div>

          <nav className="db-nav">
            {navItems.map(item => (
              <button 
                key={item.id} 
                className={`db-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button className="db-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout Account</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="db-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
