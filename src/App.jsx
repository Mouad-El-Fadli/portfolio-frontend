import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Portfolio from './components/Portfolio';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import Experience from './components/Experience';
import { useState } from 'react';

const Home = () => {
  return (
    <div className="portfolio-app">
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Portfolio />
      <Footer />
    </div>
  );
};

const API = 'https://mouad12.pythonanywhere.com';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Stocke le vrai token JWT-like retourné par le serveur
        localStorage.setItem('adminToken', data.token);
        window.location.href = '/admin';
      } else {
        setError(data.message || 'Identifiants incorrects');
      }
    } catch (err) {
      setError(`Erreur réseau : ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{paddingTop: '100px', textAlign: 'center'}}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto'}}>
        <input
          type="text" placeholder="Username" required
          value={username} onChange={e => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password" placeholder="Password" required
          value={password} onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && (
          <div style={{color: '#ff5555', fontSize: '14px', padding: '8px', background: 'rgba(255,85,85,0.1)', borderRadius: '6px'}}>
            ❌ {error}
          </div>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? '⏳ Connexion...' : 'Login'}
        </button>
      </form>
      <a href="/" style={{display: 'block', marginTop: '24px'}}>← Retour au portfolio</a>
    </div>
  );
};

const ProtectedAdmin = () => {
  const token = localStorage.getItem('adminToken');
  return token ? <AdminDashboard /> : <Navigate to="/admin/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<ProtectedAdmin />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
