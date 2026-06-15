import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useAuthStore from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RequestForm from './pages/RequestForm';
import RequestDetail from './pages/RequestDetail';
import UserManagement from './pages/UserManagement';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { token, checkAuth } = useAuthStore();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/requests/new" element={<RequestForm />} />
                  <Route path="/requests/:id" element={<RequestDetail />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
