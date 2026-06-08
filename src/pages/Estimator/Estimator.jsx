import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Home, 
  Building2, 
  Warehouse, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Info,
  Zap,
  ClipboardList,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import inventoryData from '../../data/inventory.json';
import './Estimator.css';

const Estimator = () => {
  const navigate = useNavigate();
  const { addToProject } = useProject();
  const { showToast } = useToast();
  const [selectedProject, setSelectedProject] = useState(null);
  const [results, setResults] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  const projectTemplates = [
    {
      id: 'self-contain',
      title: 'Standard Self-Contain',
      description: 'Basic wiring for a single room apartment with kitchenette.',
      icon: <Home />,
      load: 'Single Phase',
      items: [
        { category: 'Cables & Wires', name: '2.5mm Single Core Copper Cable', qty: 2, unit: 'Rolls' },
        { category: 'Cables & Wires', name: '1.5mm Single Core Copper Cable', qty: 1, unit: 'Roll' },
        { category: 'Switches & Sockets', name: '13A Twin Socket Outlet', qty: 4, unit: 'Pcs' },
        { category: 'Protection', name: '6-Way Consumer Unit (DB)', qty: 1, unit: 'Pc' },
        { category: 'Lighting', name: '18W LED Ceiling Light', qty: 3, unit: 'Pcs' }
      ]
    },
    {
      id: '3-bedroom',
      title: '3-Bedroom Flat Install',
      description: 'Comprehensive material list for a standard family home.',
      icon: <Building2 />,
      load: 'Single/Three Phase',
      items: [
        { category: 'Cables & Wires', name: '2.5mm Single Core Copper Cable', qty: 6, unit: 'Rolls' },
        { category: 'Cables & Wires', name: '1.5mm Single Core Copper Cable', qty: 4, unit: 'Rolls' },
        { category: 'Cables & Wires', name: '4.0mm Single Core (for AC)', qty: 3, unit: 'Rolls' },
        { category: 'Switches & Sockets', name: '13A Twin Socket Outlet', qty: 12, unit: 'Pcs' },
        { category: 'Protection', name: '12-Way Consumer Unit (Fully Populated)', qty: 1, unit: 'Pc' },
        { category: 'Lighting', name: '18W LED Ceiling Light', qty: 15, unit: 'Pcs' },
        { category: 'Fans & Cooling', name: 'ORL 56-Inch Ceiling Fan', qty: 4, unit: 'Pcs' }
      ]
    },
    {
      id: 'office',
      title: 'Small Office Space',
      description: 'Layout for a 4-desk office with server/AC points.',
      icon: <Zap />,
      load: 'Single Phase',
      items: [
        { category: 'Cables & Wires', name: '2.5mm Single Core Copper Cable', qty: 4, unit: 'Rolls' },
        { category: 'Switches & Sockets', name: '13A Twin Socket Outlet', qty: 8, unit: 'Pcs' },
        { category: 'Protection', name: '8-Way Consumer Unit', qty: 1, unit: 'Pc' },
        { category: 'Lighting', name: '40W LED Panel Light (60x60)', qty: 6, unit: 'Pcs' },
        { category: 'Protection', name: 'Automatic Voltage Switcher (AVS)', qty: 1, unit: 'Pc' }
      ]
    }
  ];

  const handleEstimate = (project) => {
    setSelectedProject(project);
    
    // Map template items to real inventory where possible, multiplying by scaleFactor
    const mappedItems = project.items.map(item => {
      const match = inventoryData.find(p => 
        p.name.toLowerCase().includes(item.name.toLowerCase()) || 
        (p.category === item.category && p.name.includes(item.name.split(' ')[0]))
      );
      
      const adjustedQty = item.qty * scaleFactor;
      
      return {
        ...item,
        qty: adjustedQty,
        productId: match ? match.id : null,
        actualProduct: match || null,
        price: match ? match.price : 0
      };
    });

    setResults(mappedItems);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const addAllToProject = () => {
    if (!results) return;
    
    let addedCount = 0;
    results.forEach(item => {
      if (item.actualProduct) {
        addToProject(item.actualProduct, item.qty);
        addedCount++;
      }
    });

    showToast(`Added ${addedCount} essentials to your Project List!`, 'success');
  };

  return (
    <div className="estimator-page">
      <section className="estimator-hero">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="estimator-hero-content"
          >
            <div className="tool-badge"><Calculator size={14} /> Professional Engineering Tool</div>
            <h1>Project Material Estimator</h1>
            <p>Select your building type to generate an instant technical material list based on standard Nigerian electrical codes.</p>
          </motion.div>
        </div>
      </section>

      <div className="container estimator-container">
        <div className="estimator-step-header">
          <span className="step-num">01</span>
          <h2>Select Project Template</h2>
        </div>
        
        <div className="estimator-scale-control" style={{marginBottom: '24px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px'}}>
          <div>
            <h3 style={{margin: 0, fontSize: '1.1rem', color: '#0f172a'}}>Project Scale Multiplier</h3>
            <p style={{margin: 0, fontSize: '0.9rem', color: '#64748b'}}>Adjust this factor if your project is larger (e.g., 2 units of 3-bedroom flats)</p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto'}}>
            <button 
              onClick={() => setScaleFactor(Math.max(1, scaleFactor - 1))}
              style={{width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
              <Minus size={16} />
            </button>
            <span style={{fontSize: '1.2rem', fontWeight: 'bold', width: '40px', textAlign: 'center'}}>{scaleFactor}x</span>
            <button 
              onClick={() => setScaleFactor(scaleFactor + 1)}
              style={{width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="template-grid">
          {projectTemplates.map((project) => (
            <motion.div 
              key={project.id}
              className={`template-card ${selectedProject?.id === project.id ? 'active' : ''}`}
              whileHover={{ y: -5 }}
              onClick={() => handleEstimate(project)}
            >
              <div className="template-icon">{project.icon}</div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="template-footer">
                <span className="load-tag"><Zap size={12} /> {project.load}</span>
                <button className="btn-select">Generate List <ArrowRight size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="estimator-results"
            >
              <div className="estimator-step-header">
                <span className="step-num">02</span>
                <h2>Estimated Material Checklist</h2>
              </div>

              <div className="results-card">
                <div className="results-header">
                  <div className="project-info-summary">
                    <CheckCircle2 size={24} className="text-success" />
                    <div>
                      <h3>{selectedProject.title} Essentials</h3>
                      <p>Based on standard wiring requirements for {selectedProject.title.toLowerCase()}.</p>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={addAllToProject}>
                    <Plus size={18} /> Add All to Project Quote
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="estimator-table">
                    <thead>
                      <tr>
                        <th>Material Category</th>
                        <th>Recommended Specification</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th className="text-right">Est. Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.category}</strong></td>
                          <td>{item.name}</td>
                          <td><span className="qty-badge">{item.qty} {item.unit}</span></td>
                          <td>
                            {item.actualProduct ? (
                              <span className="status-in-stock">Available</span>
                            ) : (
                              <span className="status-request">Ref only</span>
                            )}
                          </td>
                          <td className="text-right">
                            {item.price > 0 ? `₦${(item.price * item.qty).toLocaleString()}` : '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-right"><strong>Estimated Essentials Total:</strong></td>
                        <td className="text-right total-cell">
                          ₦{results.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Visual Cost Breakdown Chart */}
                <div className="cost-breakdown-chart" style={{marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                  <h4 style={{marginBottom: '16px', color: '#1e293b'}}>Category Cost Breakdown</h4>
                  {(() => {
                    const grandTotal = results.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
                    if (grandTotal === 0) return <p>No pricing data available for this template.</p>;
                    
                    const categoryTotals = results.reduce((acc, curr) => {
                      acc[curr.category] = (acc[curr.category] || 0) + (curr.price * curr.qty);
                      return acc;
                    }, {});

                    return Object.entries(categoryTotals).sort((a,b) => b[1] - a[1]).map(([cat, total]) => {
                      const percentage = (total / grandTotal) * 100;
                      return (
                        <div key={cat} style={{marginBottom: '12px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px'}}>
                            <span><strong>{cat}</strong> ({percentage.toFixed(1)}%)</span>
                            <span>₦{total.toLocaleString()}</span>
                          </div>
                          <div style={{height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden'}}>
                            <div style={{height: '100%', width: `${percentage}%`, background: '#3b82f6', borderRadius: '5px'}}></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="estimator-disclaimer">
                  <Info size={16} />
                  <p>Disclaimer: This is a professional estimate for standard layouts. Actual requirements may vary based on site measurements and electrical engineers' final design. Prices are subject to current market rates.</p>
                </div>
              </div>

              <div className="estimator-next-steps">
                <div className="step-box">
                  <div className="step-icon">1</div>
                  <h4>Review & Customize</h4>
                  <p>Go to your Project List to adjust quantities or remove items.</p>
                </div>
                <div className="step-icon-divider"><ArrowRight /></div>
                <div className="step-box">
                  <div className="step-icon">2</div>
                  <h4>Submit for Quote</h4>
                  <p>Get finalized bulk pricing from our sales team via WhatsApp or PDF.</p>
                </div>
                <div className="step-icon-divider"><ArrowRight /></div>
                <div className="step-box">
                  <div className="step-icon btn-like" onClick={() => navigate('/quote')}>
                    <ClipboardList size={20} />
                  </div>
                  <h4>Go to Quotes</h4>
                  <p>View your updated site quote manager.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Estimator;
