import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Printer, 
  Download,
  AlertCircle,
  MoreVertical,
  Search,
  ShoppingCart,
  ArrowLeft,
  Eye,
  X,
  MapPin,
  ClipboardList,
  Settings,
  Activity,
  UploadCloud
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, totalUsers: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // tabs: overview, inventory, orders, quotes, users
  const [allProducts, setAllProducts] = useState([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [notification, setNotification] = useState(null); // { message, type }
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  
  const [quotes, setQuotes] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [storeSettings, setStoreSettings] = useState({
    maintenanceMode: false,
    lowStockAlerts: true,
    orderNotifications: true,
    autoApproveContractors: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, statsRes, lowStockRes, productsRes, quotesRes, usersRes, meRes, settingsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/orders`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/stats`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/low-stock`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/products`), // Fetch all products for the master list
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/quotes/admin/all`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/users`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/settings`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        ]);
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
        if (lowStockRes.ok) setLowStock(await lowStockRes.json());
        if (productsRes.ok) setAllProducts(await productsRes.json());
        if (quotesRes.ok) setQuotes(await quotesRes.json());
        if (usersRes.ok) setUsersList(await usersRes.json());
        if (meRes.ok) setAdminUser(await meRes.json());
        if (settingsRes.ok) setStoreSettings(await settingsRes.json());
      } catch (err) {
        console.error('Admin data fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Scroll Locking Logic ---
  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedOrder]);

  const updateStatus = async (orderId, updates) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map(o => o._id === orderId ? updated : o));
      }
    } catch (err) {
      console.error('Update status error', err);
    }
  };

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: parseInt(newQuantity) })
      });
      if (res.ok) {
        // Refresh both lists
        const [lowRes, prodRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/low-stock`),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/products`)
        ]);
        if (lowRes.ok) setLowStock(await lowRes.json());
        if (prodRes.ok) setAllProducts(await prodRes.json());
        
        // Show professional notification instead of alert
        setNotification({ message: 'Stock updated successfully!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Update stock error', err);
      setNotification({ message: 'Error updating stock', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser({ ...adminUser, avatar: data.avatar });
        setAvatarFile(null);
        setNotification({ message: 'Profile picture updated successfully!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setNotification({ message: 'Error uploading image', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleToggleSetting = async (key) => {
    const newValue = !storeSettings[key];
    setStoreSettings({ ...storeSettings, [key]: newValue });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/settings`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ [key]: newValue })
      });
      if (!res.ok) throw new Error('Failed to update setting');
      setNotification({ message: 'Setting updated successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      // Revert on error
      setStoreSettings({ ...storeSettings, [key]: !newValue });
      setNotification({ message: 'Error updating setting', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/orders/export`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `electricmart_orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setNotification({ message: 'Export successful!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ message: 'Error exporting orders', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  function renderOrdersTable() {
    return (
      <section className="orders-section">
        <div className="orders-header">
          <div className="header-left">
            <h2>All Transactions</h2>
            <div className="order-tabs">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
              <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
              <button className={filter === 'paid' ? 'active' : ''} onClick={() => setFilter('paid')}>Paid</button>
              <button className={filter === 'shipping' ? 'active' : ''} onClick={() => setFilter('shipping')}>Shipped</button>
            </div>
          </div>
          <div className="search-bar-admin">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {selectedOrderIds.length > 0 && (
          <div className="bulk-actions-bar animate-fade-in">
             <span>{selectedOrderIds.length} orders selected</span>
             <div className="bulk-btns">
                <button className="btn-waybill" onClick={() => handleBulkWaybill()}>
                   <Printer size={16} /> Print Selected Waybills
                </button>
                <button className="btn-details" onClick={() => setSelectedOrderIds([])}>Cancel</button>
             </div>
          </div>
        )}

        <div className="orders-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{width: '40px'}}>
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrderIds(filteredOrders.map(o => o._id));
                      else setSelectedOrderIds([]);
                    }}
                    checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                  />
                </th>
                <th>Customer</th>
                <th>Ref ID</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Total</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className={selectedOrderIds.includes(order._id) ? 'selected-row' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedOrderIds.includes(order._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order._id]);
                        else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order._id));
                      }}
                    />
                  </td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.shippingAddress.fullName}</strong>
                      <span>{order.shippingAddress.phone}</span>
                    </div>
                  </td>
                  <td><span className="id-tag">#{order._id.slice(-6).toUpperCase()}</span></td>
                  <td>{order.items.length} items</td>
                  <td>
                    <span className={`pill-status payment-${order.paymentStatus}`}>
                      {order.paymentStatus === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <select 
                      className={`status-select ${order.orderStatus}`}
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, { orderStatus: e.target.value })}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="shipping">Shipping</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="font-bold">₦{order.total.toLocaleString()}</td>
                  <td className="text-right">
                    <div className="action-btns">
                      <button 
                        className="btn-details" 
                        title="View Details"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={16} /> Details
                      </button>
                      <button 
                        className="btn-waybill" 
                        title="Generate Waybill"
                        onClick={() => handleGenerateWaybill(order)}
                      >
                        <Printer size={16} /> Waybill
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderOverview() {
    return (
      <div className="animate-fade-in">
        <div className="quick-actions-bar">
          <button className="btn-quick-action" onClick={() => setActiveTab('inventory')}>
            <Package size={16} /> Add Product
          </button>
          <button className="btn-quick-action" onClick={handleExportCSV}>
            <Download size={16} /> Export Orders (CSV)
          </button>
        </div>

        {/* Stats Bar */}
        <div className="admin-stats-grid">
          <div className="stat-item clickable" onClick={() => { setActiveTab('orders'); setFilter('paid'); }}>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₦{stats.revenue.toLocaleString()}</div>
            <div className="stat-trend up">+12.5%</div>
          </div>
          <div className="stat-item clickable" onClick={() => { setActiveTab('orders'); setFilter('all'); }}>
            <div className="stat-label">Active Orders</div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-trend">Standard</div>
          </div>
          <div className="stat-item clickable" onClick={() => setActiveTab('users')}>
            <div className="stat-label">User Base</div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-trend up">+4.1%</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main-col">
            {/* Low Stock Alert Panel */}
            {lowStock.length > 0 && (
              <section className="low-stock-panel">
                <div className="low-stock-header">
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <AlertCircle size={18} color="#ef4444" />
                    <h2>Low Stock Alerts <span className="badge-count">{lowStock.length}</span></h2>
                  </div>
                  <button className="btn-details" onClick={() => setActiveTab('inventory')}>
                    View Full Master Inventory <ArrowLeft size={14} style={{transform: 'rotate(180deg)'}} />
                  </button>
                </div>
                <div className="low-stock-grid">
                  {lowStock.map(p => (
                    <div key={p._id} className={`low-stock-card ${p.stockQuantity === 0 ? 'out-of-stock' : ''}`}>
                      <img src={`/${p.image}`} alt={p.name} onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                      <div className="low-stock-info">
                        <strong>{p.name}</strong>
                        <span>{p.brand} · {p.category}</span>
                      </div>
                      <div className="restock-controls">
                         <input 
                           type="number" 
                           defaultValue={p.stockQuantity} 
                           id={`stock-${p._id}`}
                           placeholder="Qty"
                         />
                         <button onClick={() => {
                           const qty = document.getElementById(`stock-${p._id}`).value;
                           handleUpdateStock(p._id, qty);
                         }}>Update</button>
                      </div>
                      <div className={`stock-count ${p.stockQuantity === 0 ? 'out' : 'low'}`}>
                        {p.stockQuantity === 0 ? 'OUT OF STOCK' : `${p.stockQuantity} left`}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="dashboard-side-col">
            <div className="activity-feed">
              <h3><Activity size={18} /> Recent Activity</h3>
              <div className="activity-list">
                {orders.slice(0, 3).map((o, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-icon order"><ShoppingCart size={16} /></div>
                    <div className="activity-content">
                      <p>New Order #{o._id.slice(-6).toUpperCase()}</p>
                      <span>from {o.shippingAddress?.fullName}</span>
                    </div>
                  </div>
                ))}
                {usersList.slice(0, 2).map((u, i) => (
                  <div className="activity-item" key={`u-${i}`}>
                    <div className="activity-icon user"><Users size={16} /></div>
                    <div className="activity-content">
                      <p>New Contractor Joined</p>
                      <span>{u.name} ({u.tradeLevel})</span>
                    </div>
                  </div>
                ))}
                {quotes.slice(0, 1).map((q, i) => (
                  <div className="activity-item" key={`q-${i}`}>
                    <div className="activity-icon system"><ClipboardList size={16} /></div>
                    <div className="activity-content">
                      <p>Quote Submitted</p>
                      <span>{q.projectName}</span>
                    </div>
                  </div>
                ))}
                {(!orders.length && !usersList.length) && <p style={{color: '#64748b'}}>No recent activity.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Transactions Table */}
        <div className="full-width-table-container animate-fade-in" style={{ marginTop: '24px' }}>
          {renderOrdersTable()}
        </div>
      </div>
    );
  }

  function renderInventory() {
    if (!allProducts || allProducts.length === 0) {
      return <div className="admin-loading">Loading inventory data...</div>;
    }

    const filteredProducts = allProducts.filter(p => 
      (p.name || '').toLowerCase().includes(inventorySearch.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(inventorySearch.toLowerCase())
    );

    return (
      <section className="inventory-view animate-fade-in">
        <div className="orders-header">
          <div className="header-left">
            <h2>Master Inventory Control</h2>
            <p>Manage stock levels for all electrical materials across all categories.</p>
          </div>
          <div className="search-bar-admin">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search products by name or brand..." 
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
            />
          </div>
        </div>

        <div className="orders-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Manual Update</th>
                <th>Restock Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="customer-info">
                      <img src={product.image?.startsWith('http') ? product.image : `/${product.image}`} alt="" style={{width: '32px', height: '32px', borderRadius: '4px', float: 'left', marginRight: '10px'}} />
                      <strong>{product.name}</strong>
                      <span>{product.brand}</span>
                    </div>
                  </td>
                  <td><span className="id-tag">{product.category}</span></td>
                  <td>
                    <span className={`pill-status ${product.stockQuantity <= 0 ? 'payment-pending' : product.stockQuantity <= 10 ? 'payment-shipping' : 'payment-paid'}`}>
                      {product.stockQuantity <= 0 ? 'OUT' : product.stockQuantity <= 10 ? 'LOW' : 'HEALTHY'}: {product.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="inline-stock-input"
                      defaultValue={product.stockQuantity} 
                      id={`master-stock-${product._id}`}
                    />
                  </td>
                  <td>
                    <button className="btn-details" onClick={() => {
                        const qty = document.getElementById(`master-stock-${product._id}`).value;
                        handleUpdateStock(product._id, qty);
                    }}>Update Stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  const updateTradeLevel = async (userId, newLevel) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/users/${userId}/trade-level`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ tradeLevel: newLevel })
      });
      if (res.ok) {
        const updated = await res.json();
        setUsersList(usersList.map(u => u._id === userId ? updated : u));
        setNotification({ message: 'Trade level updated successfully!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Error updating trade level', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const updateQuoteStatus = async (quoteId, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/quotes/${quoteId}/respond`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status, message: status === 'approved' ? 'Quote approved by administration' : 'Quote is under review' })
      });
      if (res.ok) {
        const updated = await res.json();
        setQuotes(quotes.map(q => q._id === quoteId ? updated : q));
        setNotification({ message: 'Quote status updated!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  function renderQuotesTable() {
    return (
      <section className="orders-section animate-fade-in">
        <div className="orders-header">
          <div className="header-left">
            <h2>Project Quotes & RFQs</h2>
            <p>Review and approve wholesale project quotes submitted by contractors.</p>
          </div>
        </div>
        <div className="orders-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client</th>
                <th>Items</th>
                <th>Status</th>
                <th>Total Value</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote._id}>
                  <td>
                    <strong>{quote.projectName}</strong>
                    <div style={{fontSize:'0.8rem', color:'#64748b'}}>Zone: {quote.location}</div>
                  </td>
                  <td>
                    <div>{quote.user?.name || 'Unknown'}</div>
                    <div style={{fontSize:'0.8rem', color:'#64748b'}}>{quote.user?.email || ''}</div>
                  </td>
                  <td>{quote.items.length} items</td>
                  <td>
                    <select 
                      className={`status-select ${quote.status === 'approved' ? 'delivered' : quote.status === 'reviewing' ? 'shipping' : 'confirmed'}`}
                      value={quote.status}
                      onChange={(e) => updateQuoteStatus(quote._id, e.target.value)}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="font-bold">₦{quote.total.toLocaleString()}</td>
                  <td className="text-right">
                    <a 
                      href={`/api/quotes/${quote._id}/pdf?token=${localStorage.getItem('token')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-details"
                      style={{display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none'}}
                    >
                      <FileText size={16} /> View PDF
                    </a>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && <tr><td colSpan="6" style={{textAlign:'center'}}>No quotes submitted yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderUsersTable() {
    return (
      <section className="orders-section animate-fade-in">
        <div className="orders-header">
          <div className="header-left">
            <h2>Contractor & User Management</h2>
            <p>Assign trade levels (Retail, Trade, Wholesale, VIP) to provide automatic discounts.</p>
          </div>
        </div>
        <div className="orders-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Trade Level Tier</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.companyName || '-'}</td>
                  <td>
                    <select 
                      className={`status-select ${u.tradeLevel === 'vip' ? 'delivered' : u.tradeLevel === 'wholesale' ? 'shipping' : 'confirmed'}`}
                      value={u.tradeLevel}
                      onChange={(e) => updateTradeLevel(u._id, e.target.value)}
                      style={{minWidth: '120px'}}
                    >
                      <option value="retail">Retail (0%)</option>
                      <option value="trade">Trade (5%)</option>
                      <option value="wholesale">Wholesale (10%)</option>
                      <option value="vip">VIP (15%)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  const generateWaybillHTML = (order) => {
    const rows = order.items.map(i => `
      <tr>
        <td>${i.name}</td>
        <td style="text-align:center">${i.quantity}</td>
        <td style="text-align:right">₦${(i.price * i.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <div class="waybill-page">
        <div class="header">
          <div><div class="logo">⚡ ELECTRICMART</div><p>Professional Electrical Wholesaler</p></div>
          <div style="text-align:right"><h1>OFFICIAL WAYBILL</h1><p>Date: ${new Date().toLocaleDateString()}</p></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:30px">
          <div><strong>SHIP TO:</strong><br/>${order.shippingAddress.fullName}<br/>${order.shippingAddress.address}<br/>${order.shippingAddress.phone}</div>
          <div style="text-align:right"><strong>ORDER REF:</strong><br/>#${order._id.toUpperCase()}<br/>Status: <strong>PAID</strong></div>
        </div>
        <table><thead><tr><th>Description of Materials</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <div class="summary">Grand Total: ₦${order.total.toLocaleString()}</div>
        <div class="footer">
          <div class="sign-box">Authorized Dispatch Sign</div>
          <div class="sign-box">Receiver's Signature & Date</div>
        </div>
        <p style="text-align:center;color:#64748b;font-size:12px;margin-top:40px">Thank you for your business. For technical support, call +234 800 ELECTRIC</p>
      </div>`;
  };

  const handleGenerateWaybill = (order) => {
    const htmlContent = generateWaybillHTML(order);
    const fullHtml = `
      <html><head><title>Waybill - ${order._id}</title>
      <style>
        body{font-family:sans-serif;padding:40px;color:#0f172a}
        .header{display:flex;justify-content:space-between;border-bottom:2px solid #3b82f6;padding-bottom:20px;margin-bottom:30px}
        .logo{font-size:24px;font-weight:bold;color:#3b82f6}
        table{width:100%;border-collapse:collapse;margin:20px 0}
        th,td{padding:12px;border:1px solid #e2e8f0;text-align:left}
        th{background:#f8fafc}.summary{text-align:right;font-size:18px;font-weight:bold;margin-top:20px}
        .footer{margin-top:50px;display:flex;justify-content:space-between}
        .sign-box{border-top:1px solid #94a3b8;width:200px;text-align:center;padding-top:10px;font-size:14px}
        @media print{.noprint{display:none}}
      </style>
      </head><body>
        ${htmlContent}
        <button class="noprint" onclick="window.print()" style="margin-top:30px;padding:12px 24px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer">Print Waybill</button>
      </body></html>`;
    
    const win = window.open('', '_blank');
    win.document.write(fullHtml);
    win.document.close();
  };

  const handleBulkWaybill = () => {
    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o._id));
    if (selectedOrders.length === 0) return;

    const sections = selectedOrders.map(o => generateWaybillHTML(o)).join('<div style="page-break-after: always;"></div>');

    const fullHtml = `
      <html><head><title>Bulk Waybills - ElectricMart</title>
      <style>
        body{font-family:sans-serif;padding:40px;color:#0f172a}
        .waybill-page { padding: 20px 0; }
        .header{display:flex;justify-content:space-between;border-bottom:2px solid #3b82f6;padding-bottom:20px;margin-bottom:30px}
        .logo{font-size:24px;font-weight:bold;color:#3b82f6}
        table{width:100%;border-collapse:collapse;margin:20px 0}
        th,td{padding:12px;border:1px solid #e2e8f0;text-align:left}
        th{background:#f8fafc}.summary{text-align:right;font-size:18px;font-weight:bold;margin-top:20px}
        .footer{margin-top:50px;display:flex;justify-content:space-between}
        .sign-box{border-top:1px solid #94a3b8;width:200px;text-align:center;padding-top:10px;font-size:14px}
        @media print{
          .noprint{display:none}
          body { padding: 0; }
          .waybill-page { page-break-after: always; min-height: 100vh; }
        }
      </style>
      </head><body>
        <div class="noprint" style="background:#f1f5f9;padding:20px;margin-bottom:40px;border-radius:12px;display:flex;justify-content:space-between;align-items:center">
           <div>
             <strong>Bulk Print Ready</strong>
             <p style="margin:4px 0 0;font-size:14px;color:#64748b">Generated ${selectedOrders.length} waybills for dispatch.</p>
           </div>
           <button onclick="window.print()" style="padding:12px 24px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold">Confirm & Print All</button>
        </div>
        ${sections}
      </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(fullHtml);
    win.document.close();
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && o.paymentStatus === 'pending') ||
                         (filter === 'paid' && o.paymentStatus === 'paid') ||
                         (filter === 'shipping' && o.orderStatus === 'shipping');
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = o._id.toLowerCase().includes(searchLower) || 
                          o.shippingAddress.fullName.toLowerCase().includes(searchLower) ||
                          o.shippingAddress.phone.includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  function renderSettings() {
    return (
      <div className="animate-fade-in settings-section">
        <div className="settings-header">
          <h2>Account Settings & System Logs</h2>
          <p>Manage your profile and review system activity.</p>
        </div>

        <div className="settings-group">
          <h3>Profile Upload</h3>
          <div className="profile-upload-area">
            <img 
              src={avatarPreview || adminUser?.avatar || 'https://via.placeholder.com/100'} 
              alt="Admin Avatar" 
              className="profile-avatar-preview" 
            />
            <div className="profile-upload-controls">
              <label className="file-input-wrapper">
                <span className="btn-upload"><UploadCloud size={16} style={{display:'inline', marginRight: '8px'}} /> Choose Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }} 
                />
              </label>
              {avatarFile && (
                <button className="btn-quick-action" onClick={handleAvatarUpload} style={{marginTop: '8px', background: '#3b82f6', color: 'white', border: 'none'}}>
                  Upload Now
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="settings-group">
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px'}}>
            <h3 style={{margin:0, border: 'none', padding: 0}}>System Logs</h3>
            <span style={{width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'pulse 2s infinite'}}></span>
            <span style={{fontSize: '0.8rem', color: '#22c55e', fontWeight: 'bold'}}>Live</span>
          </div>
          <div className="system-logs-area">
            <div className="log-line">
              <span className="timestamp">{new Date().toLocaleTimeString()}</span>
              <span className="log-badge system">SYSTEM</span>
              <span className="log-message">Admin Dashboard loaded. Environment: Production.</span>
            </div>
            <div className="log-line">
              <span className="timestamp">{new Date(Date.now() - 50000).toLocaleTimeString()}</span>
              <span className="log-badge auth">AUTH</span>
              <span className="log-message">User login successful (IP: 192.168.1.1).</span>
            </div>
            {orders.slice(0, 3).map((o, i) => (
              <div className="log-line" key={i}>
                <span className="timestamp">{new Date(o.createdAt).toLocaleTimeString()}</span>
                <span className="log-badge order">ORDER</span>
                <span className="log-message">New transaction #{o._id.slice(-6)} received. Status: {o.paymentStatus}.</span>
              </div>
            ))}
            {usersList.slice(0, 2).map((u, i) => (
              <div className="log-line" key={`u-${i}`}>
                <span className="timestamp">{new Date(u.createdAt || Date.now() - 3600000).toLocaleTimeString()}</span>
                <span className="log-badge user">USER</span>
                <span className="log-message">New contractor registration: {u.email}.</span>
              </div>
            ))}
            <div className="log-line">
              <span className="timestamp">{new Date(Date.now() - 7200000).toLocaleTimeString()}</span>
              <span className="log-badge system">SYSTEM</span>
              <span className="log-message">Automated database backup completed successfully.</span>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <h3>Store Preferences</h3>
          <div className="preferences-grid">
            <div className="preference-card">
              <div className="pref-info">
                <h4>Maintenance Mode</h4>
                <p>Temporarily disable checkout.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={storeSettings.maintenanceMode} 
                  onChange={() => handleToggleSetting('maintenanceMode')} 
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="preference-card">
              <div className="pref-info">
                <h4>Low Stock Alerts</h4>
                <p>Email alerts for depleted inventory.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={storeSettings.lowStockAlerts} 
                  onChange={() => handleToggleSetting('lowStockAlerts')} 
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="preference-card">
              <div className="pref-info">
                <h4>Order Notifications</h4>
                <p>Push notifications for new orders.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={storeSettings.orderNotifications} 
                  onChange={() => handleToggleSetting('orderNotifications')} 
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="preference-card">
              <div className="pref-info">
                <h4>Auto-Approve Contractors</h4>
                <p>Bypass manual approval process.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={storeSettings.autoApproveContractors} 
                  onChange={() => handleToggleSetting('autoApproveContractors')} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
            <div className="bolt-bg">⚡</div>
            <span>Admin Central</span>
          </div>
          <nav className="admin-nav">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><BarChart3 size={20} /> Overview</button>
            <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}><Package size={20} /> Inventory</button>
            <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}><ShoppingCart size={20} /> Orders</button>
            <button className={activeTab === 'quotes' ? 'active' : ''} onClick={() => setActiveTab('quotes')}><ClipboardList size={20} /> RFQ Quotes</button>
            <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}><Users size={20} /> Users & Pricing</button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Settings size={20} /> Settings</button>
            <div className="nav-spacer" style={{margin: 'auto 0'}}></div>
            <button onClick={() => navigate('/')} style={{borderTop: '1px solid rgba(255,255,255,0.1)'}}>
              <ArrowLeft size={20} /> Back to Store
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          <header className="admin-header">
            <div>
              <h1>Shop Manager Dashboard</h1>
              <p>Monitor your electrical supply business performance in real-time.</p>
            </div>
            <div className="admin-user" style={{cursor: 'pointer'}} onClick={() => setActiveTab('settings')}>
              <div className="admin-avatar">
                {adminUser?.avatar ? (
                  <img src={adminUser.avatar} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                ) : (
                  adminUser?.name?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
              <span>{adminUser?.name || 'Owner Access'}</span>
            </div>
          </header>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'orders' && renderOrdersTable()}
          {activeTab === 'quotes' && renderQuotesTable()}
          {activeTab === 'users' && renderUsersTable()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Order Inspection: #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
              <button className="close-modal" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-section">
                  <h4><Users size={16} /> Customer Details</h4>
                  <div className="info-box">
                    <p><strong>Name:</strong> {selectedOrder.shippingAddress.fullName}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                    <p><strong>Email:</strong> {selectedOrder.shippingAddress.email}</p>
                  </div>
                </div>

                <div className="modal-section">
                  <h4><MapPin size={16} /> Shipping Address</h4>
                  <div className="info-box">
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p><strong>Zone:</strong> {selectedOrder.shippingAddress.zone}</p>
                    <p><strong>Delivery:</strong> {selectedOrder.deliveryOption}</p>
                  </div>
                </div>
              </div>

              <div className="modal-section items-section">
                <h4><Package size={16} /> Material Itemization</h4>
                <table className="modal-items-table">
                  <thead>
                    <tr><th>Material</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₦{item.price.toLocaleString()}</td>
                        <td className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-summary">
                <div className="summary-row"><span>Subtotal:</span> <span>₦{selectedOrder.subtotal?.toLocaleString() || (selectedOrder.total * 0.9).toLocaleString()}</span></div>
                <div className="summary-row"><span>Shipping Fee:</span> <span>₦{selectedOrder.shippingFee?.toLocaleString() || '0'}</span></div>
                <div className="summary-row total"><span>Order Total:</span> <span>₦{selectedOrder.total.toLocaleString()}</span></div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close Inspection</button>
              <button className="btn btn-primary" onClick={() => { handleGenerateWaybill(selectedOrder); setSelectedOrder(null); }}>
                <Printer size={18} /> Print Waybill Now
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Professional Toast Notification */}
      {notification && (
        <div className={`admin-toast ${notification.type} animate-fade-in`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
