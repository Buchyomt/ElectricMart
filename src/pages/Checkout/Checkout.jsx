import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  Check, 
  Truck, 
  Zap, 
  MapPin, 
  Store, 
  Lock, 
  ShieldCheck, 
  RefreshCcw, 
  ChevronRight,
  ArrowRight,
  CreditCard,
  Building2,
  PhoneCall,
  Info,
  Shield,
  Trash2,
  Plus,
  Minus,
  ShoppingCart
} from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const { user, token } = useAuth();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1); // Starting at Step 1 (Cart)
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    zone: 'Island — Lekki / VI / Ikoyi',
    cardNumber: '4532 8821 0092 8721',
    expiry: '08/27',
    cvv: '***'
  });

  // Calculations
  const subtotal = cartTotal;
  const shippingFee = currentStep >= 2 ? 7500 : 0; // Only add shipping if at Delivery step
  const vat = subtotal * 0.075;
  const total = subtotal + shippingFee + vat;

  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const generateInvoice = (order) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // --- BRANDING & COLORS ---
    const primaryBlue = [37, 99, 235];
    const slateBackground = [248, 250, 252];
    const darkSlate = [15, 23, 42];
    const grayText = [100, 116, 139];
    
    // Header Banner
    doc.setFillColor(...slateBackground);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Logo
    doc.setFontSize(26);
    doc.setTextColor(...primaryBlue);
    doc.setFont("helvetica", "bold");
    doc.text("ELECTROMART", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.text("Professional B2B Electrical Marketplace", 20, 32);
    doc.text("Lagos, Nigeria | +234 800 ELECTRO", 20, 37);

    // Invoice Meta
    doc.setFontSize(16);
    doc.setTextColor(...darkSlate);
    doc.text("TAX INVOICE", 140, 20);
    
    doc.setFontSize(9);
    doc.text(`REFERENCE: ${order.orderId}`, 140, 27);
    doc.text(`DATE: ${new Date().toLocaleDateString().toUpperCase()}`, 140, 32);
    doc.text(`STATUS: `, 140, 37);
    doc.setTextColor(34, 197, 94); // Green for Paid
    doc.setFont("helvetica", "bold");
    doc.text("PAID", 155, 37);

    // Bill To Section
    doc.setTextColor(...darkSlate);
    doc.setFontSize(11);
    doc.text("CLIENT / BILL TO:", 20, 55);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 57, 80, 57);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(order.name, 20, 64);
    doc.setFont("helvetica", "normal");
    doc.text(order.address, 20, 69);
    doc.text(`Zone: ${order.zone}`, 20, 74);

    // Shipping Details
    doc.setFontSize(11);
    doc.text("DELIVERY INFO:", 110, 55);
    doc.line(110, 57, 170, 57);
    doc.setFontSize(10);
    doc.text(`Method: ${order.deliveryDate.split('—')[1] || 'Express'}`, 110, 64);
    doc.text(`Est. Delivery: ${order.deliveryDate.split('—')[0]}`, 110, 69);

    // Table Header
    doc.setFillColor(30, 41, 59); // Dark blue/slate header
    doc.rect(20, 85, 170, 10, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION OF ELECTRICAL MATERIALS", 25, 91.5);
    doc.text("QTY", 120, 91.5);
    doc.text("UNIT PRICE", 140, 91.5);
    doc.text("TOTAL", 170, 91.5);

    // Table Items
    let y = 103;
    doc.setTextColor(...darkSlate);
    doc.setFont("helvetica", "normal");
    order.items.forEach((item, index) => {
      // Alternate row background (subtle)
      if (index % 2 === 0) {
        doc.setFillColor(252, 253, 255);
        doc.rect(20, y - 6, 170, 10, 'F');
      }
      
      doc.text(item.name.substring(0, 48), 25, y);
      doc.text(item.quantity.toString(), 122, y);
      doc.text(`N${item.price.toLocaleString()}`, 140, y);
      doc.text(`N${(item.price * item.quantity).toLocaleString()}`, 170, y);
      y += 10;
    });

    // Totals Section
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(120, y, 190, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(...grayText);
    doc.text("Subtotal:", 130, y);
    doc.setTextColor(...darkSlate);
    doc.text(`N${order.subtotal.toLocaleString()}`, 170, y);
    
    y += 7;
    doc.setTextColor(...grayText);
    doc.text("Delivery Fee:", 130, y);
    doc.setTextColor(...darkSlate);
    doc.text(`N${order.shippingFee.toLocaleString()}`, 170, y);
    
    y += 7;
    doc.setTextColor(...grayText);
    doc.text("VAT (7.5%):", 130, y);
    doc.setTextColor(...darkSlate);
    doc.text(`N${Math.round(order.vat).toLocaleString()}`, 170, y);
    
    y += 10;
    doc.setFillColor(...slateBackground);
    doc.rect(130, y - 6, 60, 10, 'F');
    doc.setFontSize(12);
    doc.setTextColor(...primaryBlue);
    doc.setFont("helvetica", "bold");
    doc.text("GRAND TOTAL:", 132, y);
    doc.text(`N${Math.round(order.total).toLocaleString()}`, 170, y);

    // Footer & Stamp
    doc.setFontSize(8);
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.text("TERMS AND CONDITIONS:", 20, 250);
    doc.text("1. All sales are final on technical equipment unless found defective upon delivery.", 20, 255);
    doc.text("2. Warranty information varies by product brand (Schneider, Nexans, etc.).", 20, 260);
    doc.text("3. This is a computer-generated tax invoice and requires no physical signature.", 20, 265);
    
    doc.setFontSize(12);
    doc.setTextColor(...primaryBlue);
    doc.setFont("helvetica", "bold");
    doc.text("THANK YOU FOR YOUR BUSINESS!", 105, 280, { align: "center" });

    doc.save(`Invoice_${order.orderId}.pdf`);
  };

  const handleCompletePayment = async () => {
    if (!token) {
      alert("Please login to complete your order.");
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend first (Pending status)
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: formData,
        deliveryOption: currentStep >= 2 ? 'express' : 'standard',
        subtotal,
        shippingFee,
        vat,
        total,
        specialInstructions: ''
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to place order');
      }

      const createdOrder = await res.json();
      
      // 2. Check if Paystack is loaded
      if (typeof window.PaystackPop === 'undefined') {
        throw new Error('Payment gateway is still loading. Please wait a moment and try again.');
      }

      // 3. Trigger Paystack Popup (Modern Method)
      // --- IMPORTANT: REPLACE THE KEY BELOW WITH YOUR REAL PAYSTACK PUBLIC KEY ---
      const PAYSTACK_PUBLIC_KEY = 'pk_test_6770db253ba896bff2c6521943b066dbf8346982'; 
      
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY, 
        email: user.email,
        amount: Math.round(total * 100), // Kobo for Paystack
        metadata: {
          order_id: createdOrder._id,
          custom_fields: [
            { display_name: "Order ID", variable_name: "order_id", value: createdOrder._id }
          ]
        },
        callback: async (response) => {
          console.log('Payment Successful', response);
          
          try {
            // Update backend payment status
            await fetch(`/api/orders/${createdOrder._id}/pay`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ reference: response.reference })
            });
          } catch (err) {
            console.error('Failed to update payment status on backend', err);
          }
          
          setConfirmedOrder({
            orderId: 'EM-' + createdOrder._id.substring(createdOrder._id.length - 6).toUpperCase(),
            items: [...cartItems],
            subtotal,
            shippingFee,
            vat,
            total,
            paymentMethod: 'Paystack — ' + response.status,
            deliveryDate: 'Tomorrow by 5PM — ' + (currentStep >= 2 ? 'Express' : 'Standard'),
            address: formData.address || 'Address not set',
            zone: formData.zone,
            name: formData.fullName
          });
          
          document.body.style.overflow = 'unset';
          clearCart();
          setCurrentStep(4);
        },
        onClose: () => {
          document.body.style.overflow = 'unset';
          setLoading(false);
        }
      });

      document.body.style.overflow = 'hidden';
      handler.openIframe();

    } catch (error) {
      console.error('Order error:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const steps = [
    { id: 1, name: 'Cart', status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending' },
    { id: 2, name: 'Delivery', status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending' },
    { id: 3, name: 'Payment', status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending' },
    { id: 4, name: 'Confirmation', status: currentStep === 4 ? 'completed' : 'pending' }
  ];

  // --- Step 1: Cart View ---
  const renderCart = () => (
    <section className="checkout-card animate-fade-in">
      <div className="card-header">
        <div className="card-icon blue"><ShoppingCart size={20} /></div>
        <div>
          <h2>Review Your Cart</h2>
          <p>Check your items and quantities before proceeding</p>
        </div>
      </div>
      
      <div className="cart-list-checkout">
        {cartItems.map(item => (
          <div key={item._id || item.id} className="cart-item-checkout">
            <img src={`/${item.image}`} alt={item.name} />
            <div className="item-info">
              <h4>{item.name}</h4>
              <span className="item-price">₦{item.price.toLocaleString()}</span>
            </div>
            <div className="qty-controls">
              <button onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}><Minus size={14} /></button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}><Plus size={14} /></button>
            </div>
            <div className="item-total">₦{(item.price * item.quantity).toLocaleString()}</div>
            <button className="remove-btn" onClick={() => removeFromCart(item._id || item.id)}><Trash2 size={16} /></button>
          </div>
        ))}
        {cartItems.length === 0 && <div className="empty-cart-msg">Your cart is empty. <Link to="/shop">Go Shopping</Link></div>}
      </div>

      {cartItems.length > 0 && (
        <button className="btn-next-step" onClick={nextStep}>
          Proceed to Delivery <ArrowRight size={18} />
        </button>
      )}
    </section>
  );

  // --- Step 2: Delivery View ---
  const renderDelivery = () => (
    <section className="checkout-card animate-fade-in">
      <div className="card-header">
        <div className="card-icon blue"><MapPin size={20} /></div>
        <div>
          <h2>Delivery Details</h2>
          <p>Where should we send your order?</p>
        </div>
      </div>

      <div className="payment-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Receiver's Name" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+234..." />
          </div>
        </div>
        <div className="form-group">
          <label>Delivery Address</label>
          <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street address, Apartment, etc." />
        </div>
        <div className="form-group">
          <label>Lagos Zone</label>
          <select value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})}>
            <option>Island — Lekki / VI / Ikoyi</option>
            <option>Mainland — Ikeja / Surulere</option>
            <option>Outskirts — Ajah / Ikorodu</option>
          </select>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-back" onClick={prevStep}>Back to Cart</button>
        <button className="btn-next-step" onClick={nextStep}>
          Proceed to Payment <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );

  // --- Step 3: Payment View ---
  const renderPayment = () => (
    <div className="animate-fade-in">
      <section className="checkout-card">
        <div className="card-header">
          <div className="card-icon blue"><CreditCard size={20} /></div>
          <div>
            <h2>Select Payment Method</h2>
            <p>Choose how you'd like to pay for your order</p>
          </div>
        </div>

        <div className="payment-methods-list">
          <div className={`payment-option-card ${paymentMethod === 'paystack' ? 'active' : ''}`} onClick={() => setPaymentMethod('paystack')}>
            <div className="option-radio"><div className={`radio-outer ${paymentMethod === 'paystack' ? 'selected' : ''}`}><div className="radio-inner"></div></div></div>
            <div className="option-content">
              <div className="option-title-row">
                <span className="option-title">Paystack Card Payment</span>
                <div className="badge-secured"><ShieldCheck size={12} /> Secured Gateway</div>
              </div>
              <p>Pay securely with your debit or credit card, Bank Transfer, or USSD.</p>
              <div className="card-logos">
                <CreditCard size={16} color="#3b82f6" />
                <span style={{fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Visa / Mastercard / Verve</span>
              </div>
            </div>
          </div>
          <div className={`payment-option-card ${paymentMethod === 'bank' ? 'active' : ''}`} onClick={() => setPaymentMethod('bank')}>
            <div className="option-radio"><div className={`radio-outer ${paymentMethod === 'bank' ? 'selected' : ''}`}><div className="radio-inner"></div></div></div>
            <div className="option-content">
              <div className="option-title-row"><span className="option-title"><Building2 size={16} /> Bank Transfer</span></div>
              <p>Get a unique account number for this order</p>
              <button className="btn-action-outline">Generate Account Number</button>
            </div>
          </div>
        </div>
      </section>

      {paymentMethod === 'paystack' && (
        <section className="checkout-card">
          <div className="card-header">
            <div className="card-icon blue"><ShieldCheck size={20} /></div>
            <div>
              <h2>Pay Online with Secure Gateway</h2>
              <p>You will be redirected to the secure Paystack portal to complete your transaction.</p>
            </div>
          </div>
          <div className="payment-form">
             <div className="paystack-info-box">
                <Info size={18} />
                <p>We support all Nigerian cards, Bank Transfers, and USSD payments via Paystack.</p>
             </div>
          </div>
          <button className="btn-complete-payment" onClick={handleCompletePayment} disabled={loading}>
            <Lock size={18} /> {loading ? 'Initializing...' : `Pay Now — ₦${Math.round(total).toLocaleString()}`} <ArrowRight size={18} />
          </button>
        </section>
      )}
      <button className="btn-back mt-4" onClick={prevStep}>Back to Delivery</button>
    </div>
  );

  // --- Step 4: Confirmation View ---
  const renderConfirmation = () => {
    if (!confirmedOrder) return null;
    return (
      <div className="confirmation-wrapper animate-fade-in">
        {/* Banner */}
        <div className="confirmation-banner">
          <div className="success-circle-large"><Check size={36} strokeWidth={3} /></div>
          <h1>Order Confirmed! 🎉</h1>
          <p>Thank you, {confirmedOrder.name.split(' ')[0]}. Your order has been placed successfully.</p>
          <div className="order-id-badge">{confirmedOrder.orderId}</div>
        </div>

        {/* Info Cards */}
        <div className="confirmation-info-row">
          <div className="info-card">
            <div className="info-icon-box"><ShieldCheck size={18} /></div>
            <div className="info-details">
              <span>ORDER ID</span>
              <strong>{confirmedOrder.orderId}</strong>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon-box"><CreditCard size={18} /></div>
            <div className="info-details">
              <span>PAYMENT METHOD</span>
              <strong>{confirmedOrder.paymentMethod}</strong>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon-box"><Truck size={18} /></div>
            <div className="info-details">
              <span>ESTIMATED DELIVERY</span>
              <strong>{confirmedOrder.deliveryDate}</strong>
            </div>
          </div>
        </div>

        <div className="confirmation-grid">
          {/* Left Column */}
          <div className="confirmation-left">
            <div className="order-items-card">
              <div className="card-header-simple">
                <h3>Order Items</h3>
                <span>{confirmedOrder.items.length} items</span>
              </div>
              <div className="ordered-items-list">
                {confirmedOrder.items.length > 0 ? confirmedOrder.items.map(item => (
                  <div key={item._id || item.id} className="ordered-item">
                    <img src={`/${item.image}`} alt={item.name} />
                    <div className="ordered-item-info">
                      <span className="brand-tag">{item.brand || 'Generic'}</span>
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="ordered-item-price">₦{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                )) : (
                  // Mock Items if cart was empty
                  <>
                    <div className="ordered-item">
                      <img src="/cable.png" alt="Nexans Cable" />
                      <div className="ordered-item-info">
                        <span className="brand-tag">Nexans</span>
                        <h4>Nexans 4mm² 4-Core Armored Cable</h4>
                        <p>Qty: 2</p>
                      </div>
                      <div className="ordered-item-price">₦178,000</div>
                    </div>
                    <div className="ordered-item">
                      <img src="/breaker.png" alt="Schneider MCB" />
                      <div className="ordered-item-info">
                        <span className="brand-tag">Schneider</span>
                        <h4>Schneider Easy9 MCB 63A Single Pole</h4>
                        <p>Qty: 6</p>
                      </div>
                      <div className="ordered-item-price">₦87,300</div>
                    </div>
                  </>
                )}
              </div>
              <div className="order-totals-breakdown">
                <div className="breakdown-row"><span>Subtotal</span><span>₦{confirmedOrder.subtotal.toLocaleString()}</span></div>
                <div className="breakdown-row"><span>Delivery (Express — Lekki)</span><span>₦{confirmedOrder.shippingFee.toLocaleString()}</span></div>
                <div className="breakdown-row"><span>VAT (7.5%)</span><span>₦{Math.round(confirmedOrder.vat).toLocaleString()}</span></div>
                <div className="breakdown-row grand"><span>Grand Total</span><span>₦{Math.round(confirmedOrder.total).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Recommendations using real inventory */}
            <div className="recommendations-section">
              <div className="card-header-simple">
                <h3>You May Also Need</h3>
                <Link to="/shop" className="view-all-link">View all <ArrowRight size={14} /></Link>
              </div>
              <div className="recommendations-grid">
                {[
                  { id: 24, name: "Pure Copper House Wiring Cable", brand: "Generic", price: 34000, image: "Wires and Cables .jpeg" },
                  { id: 5, name: "Automatic Voltage Switcher (AVS)", brand: "Generic", price: 15000, image: "Automatic Voltage Switcher .jpeg" },
                  { id: 1, name: "AKT 100W LED Flood Light", brand: "AKT", price: 27000, image: "AKT 100 watt Flood Light.jpeg" }
                ].map(prod => (
                  <div key={prod.id} className="rec-card">
                    <img src={`/${prod.image}`} alt={prod.name} />
                    <span className="rec-brand">{prod.brand}</span>
                    <h5>{prod.name}</h5>
                    <div className="rec-price">₦{prod.price.toLocaleString()}</div>
                    <button className="btn-add-rec"><ShoppingCart size={14}/> Add to Cart</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="confirmation-right">
            <div className="action-card">
              <div className="card-header-simple">
                <h3><Truck size={18} /> Track Your Order</h3>
              </div>
              <p>Stay updated on your delivery status.</p>
              <button 
                className="btn-track-primary" 
                onClick={() => navigate(`/track/${confirmedOrder?.orderId || ''}`)}
              >
                <MapPin size={16}/> Track Order Now
              </button>
              <button 
                className="btn-track-secondary"
                onClick={() => {
                  const message = `Hello! I just placed a professional order on ElectroMart⚡\n\nOrder ID: #${confirmedOrder.orderId}\nTotal: N${confirmedOrder.total.toLocaleString()}\n\nYou can track my material dispatch here: ${window.location.origin}/track/${confirmedOrder.orderId}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }}
              >
                Share via WhatsApp
              </button>
            </div>

            <div className="action-card">
              <div className="card-header-simple">
                <h3><Info size={18} /> Download Invoice</h3>
              </div>
              <p>Get a PDF copy for your records.</p>
              <button className="btn-track-secondary" onClick={() => generateInvoice(confirmedOrder)}>Download PDF</button>
            </div>

            <div className="timeline-card">
              <div className="card-header-simple">
                <h3>What's Next?</h3>
              </div>
              <div className="timeline">
                <div className="timeline-item active">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Order Packed</h4>
                    <p>Within 2 hours at Lagos warehouse</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Out for Delivery</h4>
                    <p>Tomorrow morning, 8AM dispatch</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Delivered to {confirmedOrder.zone.split(' ')[0]}</h4>
                    <p>Tomorrow by 5PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-footer-actions">
          <button className="btn-back" onClick={() => navigate('/shop')}><ArrowRight size={16} className="rotate-180"/> Continue Shopping</button>
          <button className="btn-next-step" onClick={() => navigate('/account')} style={{ width: 'auto', padding: '1.1rem 2rem' }}>Go to Dashboard</button>
        </div>
      </div>
    );
  };

  return (
    <div className="checkout-page">
      <div className="checkout-stepper-bg">
        <div className="container">
          <div className="stepper">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`step ${step.status}`}>
                  <div className="step-circle">{step.status === 'completed' ? <Check size={14} /> : step.id}</div>
                  <span className="step-name">{step.name}</span>
                </div>
                {index < steps.length - 1 && <div className={`step-line ${step.status === 'completed' ? 'completed' : ''}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container checkout-grid">
        <main className={`checkout-main ${currentStep === 4 ? 'full-width' : ''}`}>
          {currentStep === 1 && renderCart()}
          {currentStep === 2 && renderDelivery()}
          {currentStep === 3 && renderPayment()}
          {currentStep === 4 && renderConfirmation()}
        </main>

        {currentStep < 4 && (
          <aside className="checkout-sidebar">
            <div className="summary-card">
              <div className="summary-header"><h3>Order Summary</h3><span className="badge-items">{cartItems.length} items</span></div>
              <div className="summary-calculations">
                <div className="calc-row"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
                <div className="calc-row"><span>Delivery {currentStep >= 2 ? '(Express)' : ''}</span><span>₦{shippingFee.toLocaleString()}</span></div>
                <div className="calc-row"><span>VAT (7.5%)</span><span>₦{Math.round(vat).toLocaleString()}</span></div>
                <div className="grand-total-box">
                  <span>Grand Total</span>
                  <span className="grand-price">₦{Math.round(total).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {currentStep === 3 && (
              <div className="delivery-summary-card animate-fade-in">
                <div className="summary-header"><MapPin size={18} color="var(--co-primary)" /><h4>Delivery to</h4></div>
                <div className="delivery-address-box">
                  <p><strong>{formData.address || 'Address not set'}</strong></p>
                  <div className="delivery-tags">
                    <span className="tag">{formData.zone.split(' ')[0]}</span>
                    <span className="tag-express"><Zap size={10} /> Express</span>
                  </div>
                </div>
              </div>
            )}

            <div className="security-badges">
              <div className="security-item"><Lock size={16} /> Secure Checkout</div>
              <div className="security-item"><Check size={16} /> Verified Products</div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Checkout;
