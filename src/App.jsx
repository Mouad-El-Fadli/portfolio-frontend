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
import { useState } from 'react';

const Home = () => {
  return (
    <div className="portfolio-app">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Portfolio />
      <Footer />
    </div>
  );
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    if(username === 'admin' && password === 'admin') {
      localStorage.setItem('adminToken', '123');
      window.location.href = '/admin';
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container" style={{paddingTop: '100px', textAlign: 'center'}}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto'}}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <a href="/" style={{display: 'block', marginTop: '24px'}}>Back to Portfolio</a>
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
