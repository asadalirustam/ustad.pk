import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationToast from './components/NotificationToast';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import ProvidersList from './pages/ProvidersList';
import ProviderProfile from './pages/ProviderProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/providers" element={<ProvidersList />} />
                <Route path="/providers/:id" element={<ProviderProfile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Protected Route */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Provider Protected Route */}
                <Route
                  path="/provider-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <NotificationToast />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
