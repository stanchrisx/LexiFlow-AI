import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import OCRProcessing from './components/OCRProcessing';
import Reader from './components/Reader';
import './App.css';

function App() {
  return (
    <div className="app">
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ocr-processing" element={<OCRProcessing />} />
            <Route path="/reader/:id" element={<Reader />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </div>
  );
}

export default App;
