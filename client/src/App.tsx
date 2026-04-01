import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './store/authStore';
import api from './api';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Tickets from './Tickets';

export default function App() {
  const { isAuthenticated, user, logout: storeLogout } = useAuthStore();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post(`/auth/logout`);
      storeLogout();
      setMessage('Logged out successfully');
      navigate('/login');
    } catch {
      setMessage('Logout failed');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5',
        width: '100%',
      }}
    >
      <div
        // style={{
        //   width: '100%',
        //   background: 'white',
        //   padding: '30px',
        //   borderRadius: '12px',
        //   boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        //   textAlign: 'center',
        // }}
      >
        <h3>Secure Application</h3>
        <nav>
          <Link to="/">Home</Link>
          {!isAuthenticated ? (
            <>
              {' | '}
              <Link to="/login">Login</Link> |{' '}
              <Link to="/register">Register</Link> |{' '}
              <Link to="/tickets">Tickets</Link>
            </>
          ) : (
            <>
              {' | '}
              <span>Welcome, {user?.name}!</span>
              {' | '}
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'blue',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>
        <hr />
        {message && <p>{message}</p>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tickets" element={<Tickets />} />
        </Routes>
      </div>
    </div>
  );
}
