import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowLeft,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import './TrackOrder.css';

const TrackOrder = () => {
    const { id: urlId } = useParams();
    const [searchId, setSearchId] = useState(urlId || '');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchId) return;

        setLoading(true);
        setError(null);
        setOrderData(null);

        try {
            // Clean the ID in case user pasted a long URL or something
            const cleanId = searchId.trim().replace('#', '');
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/track/${cleanId}`);
            if (!res.ok) throw new Error(`Order not found. Please check your ID.`);
            const data = await res.json();
            setOrderData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // If ID is in URL, auto-search
    useEffect(() => {
        if (urlId) {
            handleSearch();
        }
    }, [urlId]);

    const getStatusStep = (status) => {
        const stages = ['confirmed', 'packed', 'shipping', 'delivered'];
        return stages.indexOf(status);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const currentStep = orderData ? getStatusStep(orderData.status) : -1;

    return (
        <div className="track-page animate-fade-in">
            <div className="track-container">
                <header className="track-header">
                    <Link to="/shop" className="back-link"><ArrowLeft size={16} /> Back to Shop</Link>
                    <h1>Real-Time Order Tracking</h1>
                    <p>Enter your professional tracking ID to see your material dispatch status.</p>
                </header>

                <div className="search-section">
                    <form onSubmit={handleSearch} className="track-form">
                        <div className="input-group">
                            <Search size={20} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Enter Order ID (e.g. 64f12...)" 
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-track" disabled={loading}>
                            {loading ? 'Locating...' : 'Track Materials'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="track-error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {orderData && (
                    <div className="tracking-display animate-slide-up">
                        <div className="order-summary-mini">
                            <div className="summary-item">
                                <span className="label">Order Reference</span>
                                <span className="value">#{orderData.orderId.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Delivery Mode</span>
                                <span className="value capitalize">{orderData.deliveryOption} Dispatch</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Destination</span>
                                <span className="value">{orderData.zone}</span>
                            </div>
                        </div>

                        <div className="tracking-timeline">
                            <div className={`timeline-item ${currentStep >= 0 ? 'completed' : 'pending'}`}>
                                <div className="timeline-marker">
                                    <div className="marker-core">{currentStep >= 0 ? <CheckCircle2 size={16} /> : <div className="dot"></div>}</div>
                                    <div className="marker-line"></div>
                                </div>
                                <div className="timeline-content">
                                    <div className="content-main">
                                        <h4>Order Confirmed</h4>
                                        <span className="timestamp">{formatDate(orderData.createdAt)}</span>
                                    </div>
                                    <p>Your materials have been verified and payment processed.</p>
                                </div>
                            </div>

                            <div className={`timeline-item ${currentStep >= 1 ? 'completed' : currentStep === 0 ? 'active' : 'pending'}`}>
                                <div className="timeline-marker">
                                    <div className="marker-core">{currentStep >= 1 ? <CheckCircle2 size={16} /> : currentStep === 0 ? <Clock size={16} /> : <div className="dot"></div>}</div>
                                    <div className="marker-line"></div>
                                </div>
                                <div className="timeline-content">
                                    <div className="content-main">
                                        <h4>Packed & Sorted</h4>
                                        <span className="timestamp">{currentStep >= 1 ? 'Phase Complete' : 'Awaiting Processing'}</span>
                                    </div>
                                    <p>Materials are being bundled into your project batch at our Lagos warehouse.</p>
                                </div>
                            </div>

                            <div className={`timeline-item ${currentStep >= 2 ? 'completed' : currentStep === 1 ? 'active' : 'pending'}`}>
                                <div className="timeline-marker">
                                    <div className="marker-core">{currentStep >= 2 ? <CheckCircle2 size={16} /> : currentStep === 1 ? <Truck size={16} /> : <div className="dot"></div>}</div>
                                    <div className="marker-line"></div>
                                </div>
                                <div className="timeline-content">
                                    <div className="content-main">
                                        <h4>Out for Delivery</h4>
                                        <span className="timestamp">{currentStep >= 2 ? 'In Transit' : 'Scheduled'}</span>
                                    </div>
                                    <p>Materials have left the warehouse and are currently with our regional courier.</p>
                                </div>
                            </div>

                            <div className={`timeline-item ${currentStep >= 3 ? 'completed' : currentStep === 2 ? 'active' : 'pending'}`}>
                                <div className="timeline-marker">
                                    <div className="marker-core">{currentStep >= 3 ? <CheckCircle2 size={16} /> : <MapPin size={16} />}</div>
                                </div>
                                <div className="timeline-content">
                                    <div className="content-main">
                                        <h4>Materials Delivered</h4>
                                        <span className="timestamp">{currentStep >= 3 ? 'Finalized' : 'Estimate pending'}</span>
                                    </div>
                                    <p>Materials successfully arrived at your specified project site or address.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="tracking-footer">
                            <Calendar size={18} />
                            <span>Estimated arrival: <strong>{currentStep >= 2 ? 'Arriving Today' : 'Within 24-48 Hours'}</strong></span>
                        </div>
                    </div>
                )}

                {!orderData && !loading && !error && (
                    <div className="track-help-card">
                        <h3>Where is my Tracking ID?</h3>
                        <p>You can find your 24-character ID in your <strong>Order Confirmation email</strong> or in your <strong>Account History</strong>.</p>
                        <ul>
                            <li><Package size={14}/> Accurate item status</li>
                            <li><Truck size={14}/> Driver dispatch updates</li>
                            <li><MapPin size={14}/> Destination verification</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
