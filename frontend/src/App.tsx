import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Chat from './pages/Chat';
import { useApp } from './context/AppContext';

// Home component that redirects based on registration status
const Home: React.FC = () => {
  const { isRegistered } = useApp();
  return <Navigate to={isRegistered ? '/chat' : '/register'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
