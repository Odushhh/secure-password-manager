import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwords, setPasswords] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPasswords();
    }
  }, [isAuthenticated]);

  const fetchPasswords = async () => {
    try {
      const response = await fetch('/api/domains');
      const data = await response.json();
      if (data.domains) {
        setPasswords(data.domains);
      }
    } catch (error) {
      console.error('Error fetching passwords:', error);
    }
  };

  const handleLogin = async (password, existingData) => {
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, existingData }),
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswords([]);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Routes>
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard/*"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Dashboard passwords={passwords} onPasswordsChange={fetchPasswords} />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
