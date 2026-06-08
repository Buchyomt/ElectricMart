import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Landing from './pages/Landing/Landing';
import Shop from './pages/Shop/Shop';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import ProjectList from './pages/ProjectList/ProjectList';
import Checkout from './pages/Checkout/Checkout';
import Dashboard from './pages/Dashboard/Dashboard';
import Auth from './pages/Auth/Auth';
import AuthSuccess from './pages/Auth/AuthSuccess';
import Compare from './pages/Compare/Compare';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import FloatingCompareBar from './components/FloatingCompareBar/FloatingCompareBar';
import Support from './pages/Support/Support';
import Estimator from './pages/Estimator/Estimator';
import Resources from './pages/Resources/Resources';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TrackOrder from './pages/TrackOrder/TrackOrder';
import ScrollToTop from './components/ScrollToTop';

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isLandingPage = location.pathname === '/';

  return (
    <div className={`app-container ${isAdminPath ? 'admin-layout' : ''}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdminPath && <Header />}
      <main className={isAdminPath ? '' : 'animate-fade-in'} style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/store" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/quote" element={<ProjectList />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/orders" element={<Checkout />} />
          <Route path="/support" element={<Support />} />
          <Route path="/estimator" element={<Estimator />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/track/:id" element={<TrackOrder />} />
          <Route path="/account" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          {/* Catch-all route */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <FloatingCompareBar />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
