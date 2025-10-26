import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Type, 
  Volume2, 
  Search, 
  MessageSquare, 
  BarChart3,
  Plus,
  Minus,
  Palette,
  BookOpen,
  Library
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const [fontSize, setFontSize] = useState(16);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [overlayColor, setOverlayColor] = useState('#ffffff');

  const features = [
    {
      icon: Type,
      title: 'Dyslexia Mode',
      description: 'Enhanced readability for dyslexic users'
    },
    {
      icon: BookOpen,
      title: 'Reflow',
      description: 'Adaptive text flow for better reading'
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description: 'Listen to your documents aloud'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find content with AI-powered search'
    },
    {
      icon: MessageSquare,
      title: 'Annotations',
      description: 'Add notes and highlights to documents'
    },
    {
      icon: BarChart3,
      title: 'Insights',
      description: 'AI-generated document summaries'
    }
  ];

  const previewCards = [
    {
      type: 'library',
      title: 'Library',
      subtitle: 'Your Documents',
      icon: Library,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      items: ['Annual Report.pdf', 'Research Paper.pdf', 'Manual.pdf']
    },
    {
      type: 'reader',
      title: 'Reader',
      subtitle: 'AI Analysis',
      icon: FileText,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      items: ['Summary', 'Key Points', 'Questions']
    }
  ];

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-content">
          <div className="nav-brand">
            <FileText className="brand-icon" />
            <span className="brand-text">AI PDF Reader</span>
          </div>
          <div className="nav-actions">
            <Link to="/register" className="nav-link">
              Create account
            </Link>
            <Link to="/login" className="nav-button primary">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Read PDFs with AI assistance
            </h1>
            <p className="hero-description">
              Transform your document experience with intelligent reading tools, 
              accessibility features, and AI-powered insights.
            </p>
            <div className="hero-buttons">
              <Link to="/dashboard" className="hero-button primary">
                <BookOpen size={20} />
                Open Dashboard
              </Link>
              <button className="hero-button secondary">
                <Upload size={20} />
                Upload PDF
              </button>
            </div>
            <p className="hero-note">
              No data leaves your device.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Preview Cards */}
      <section className="preview-section">
        <div className="preview-content">
          <h2 className="section-title">Experience the App</h2>
          <div className="preview-cards">
            {previewCards.map((card, index) => (
              <motion.div
                key={card.type}
                className="preview-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div 
                  className="preview-header"
                  style={{ background: card.color }}
                >
                  <card.icon className="preview-icon" />
                  <div className="preview-title">
                    <h3>{card.title}</h3>
                    <p>{card.subtitle}</p>
                  </div>
                </div>
                <div className="preview-items">
                  {card.items.map((item, idx) => (
                    <div key={idx} className="preview-item">
                      <div className="preview-item-dot" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="features-content">
          <h2 className="section-title">Powerful Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Strip */}
      <section className="accessibility-section">
        <div className="accessibility-content">
          <h3 className="accessibility-title">Accessibility Controls</h3>
          <div className="accessibility-controls">
            <div className="control-group">
              <label className="control-label">
                <Type size={16} />
                Dyslexia Mode
              </label>
              <button
                className={`control-toggle ${dyslexiaMode ? 'active' : ''}`}
                onClick={() => setDyslexiaMode(!dyslexiaMode)}
              >
                <div className="toggle-thumb" />
              </button>
            </div>

            <div className="control-group">
              <label className="control-label">
                Font Size
              </label>
              <div className="font-size-controls">
                <button 
                  className="size-button"
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 12}
                >
                  <Minus size={16} />
                </button>
                <span className="size-display">A</span>
                <button 
                  className="size-button"
                  onClick={increaseFontSize}
                  disabled={fontSize >= 24}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">
                <Palette size={16} />
                Overlay Color
              </label>
              <div className="color-controls">
                {['#ffffff', '#f0f0f0', '#e8f4f8', '#fff8e1'].map(color => (
                  <button
                    key={color}
                    className={`color-button ${overlayColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setOverlayColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/privacy" className="footer-link">Privacy</Link>
            <Link to="/shortcuts" className="footer-link">Shortcuts</Link>
            <Link to="/about" className="footer-link">About</Link>
          </div>
          <p className="footer-copyright">
            © 2024 AI PDF Reader. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
