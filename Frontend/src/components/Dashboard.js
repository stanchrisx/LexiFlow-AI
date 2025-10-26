import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  User, 
  LayoutGrid, 
  List, 
  File,
  Eye,
  Download
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock PDF data
  const pdfs = [
    {
      id: 1,
      title: 'Machine Learning Trends 2024',
      pages: 24,
      date: 'Yesterday',
      thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      size: '2.4 MB'
    },
    {
      id: 2,
      title: 'Annual Financial Report',
      pages: 48,
      date: '3 days ago',
      thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      size: '5.1 MB'
    },
    {
      id: 3,
      title: 'UX Design Principles',
      pages: 32,
      date: 'Oct 12, 2023',
      thumbnail: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      size: '3.8 MB'
    },
    {
      id: 4,
      title: 'Project Phoenix Proposal',
      pages: 16,
      date: 'Oct 10, 2023',
      thumbnail: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      size: '1.9 MB'
    },
    {
      id: 5,
      title: 'Research Methodology Guide',
      pages: 56,
      date: 'Oct 8, 2023',
      thumbnail: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      size: '6.2 MB'
    },
    {
      id: 6,
      title: 'Technical Documentation',
      pages: 72,
      date: 'Oct 5, 2023',
      thumbnail: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      size: '7.5 MB'
    }
  ];

  const filteredPdfs = pdfs.filter(pdf =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    navigate('/login');
  };

  const handleUpload = () => {
    // Create a file input element and trigger click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      console.log('Selected files:', files);
      // TODO: Implement file upload logic
    };
    input.click();
  };

  const handleViewPdf = (pdfId) => {
    const pdf = pdfs.find(p => p.id === pdfId);
    if (pdf) {
      // Navigate to OCR processing screen for scanned PDFs
      navigate('/ocr-processing', { 
        state: { 
          pdf: pdf 
        } 
      });
    }
  };

  const handleDownloadPdf = (pdfId) => {
    // For now, just log the action - in a real app this would download the PDF
    console.log('Downloading PDF:', pdfId);
    // TODO: Implement PDF download logic
  };

  return (
    <div className="dashboard">
      {/* Professional Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <FileText size={24} />
              </div>
              <div className="logo-text">
                <span className="brand-name">AI PDF Reader</span>
                <span className="brand-tagline">Professional Document Processing</span>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{pdfs.length}</span>
                <span className="stat-label">Documents</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">
                  {pdfs.reduce((total, pdf) => total + pdf.pages, 0)}
                </span>
                <span className="stat-label">Pages</span>
              </div>
            </div>
            
            <button className="profile-button" onClick={handleLogout}>
              <User size={18} />
              <span>Account</span>
            </button>
          </div>
        </div>
      </header>

      {/* Professional Toolbar */}
      <div className="toolbar">
        <div className="toolbar-content">
          <div className="toolbar-left">
            <button className="upload-button primary" onClick={handleUpload}>
              <Upload size={18} />
              <span>Upload Document</span>
            </button>
            
            <div className="toolbar-divider" />
            
            <div className="search-container">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="toolbar-right">
            <div className="view-controls">
              <span className="view-label">View</span>
              <div className="view-toggle">
                <button
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="content-header">
          <h1 className="welcome-title">Welcome, Alex!</h1>
          <p className="section-subtitle">Your Recent Documents</p>
        </div>

        {filteredPdfs.length === 0 ? (
          /* Empty State */
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-icon">
              <File size={48} />
            </div>
            <h3>No PDFs yet</h3>
            <p>Upload or drag your first PDF here to get started</p>
          </motion.div>
        ) : (
          /* Content Grid/List */
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                className="pdf-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {filteredPdfs.map((pdf) => (
                  <motion.div
                    key={pdf.id}
                    className="pdf-card"
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleViewPdf(pdf.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-link">
                      <div 
                        className="pdf-thumbnail"
                        style={{ background: pdf.thumbnail }}
                      >
                        <FileText size={32} />
                      </div>
                      <div className="pdf-info">
                        <h3 className="pdf-title">{pdf.title}</h3>
                        <div className="pdf-meta">
                          <span className="pdf-pages">{pdf.pages} pages</span>
                          <span className="pdf-date">{pdf.date}</span>
                        </div>
                        <div className="pdf-actions">
                          <button 
                            className="action-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPdf(pdf.id);
                            }}
                            title="View PDF"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            className="action-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPdf(pdf.id);
                            }}
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="pdf-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="list-header">
                  <div className="list-column">Name</div>
                  <div className="list-column">Pages</div>
                  <div className="list-column">Size</div>
                  <div className="list-column">Date</div>
                  <div className="list-column">Actions</div>
                </div>
                {filteredPdfs.map((pdf) => (
                  <motion.div
                    key={pdf.id}
                    className="pdf-row"
                    whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleViewPdf(pdf.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="row-link">
                      <div className="row-thumbnail">
                        <div 
                          className="thumbnail-preview"
                          style={{ background: pdf.thumbnail }}
                        >
                          <FileText size={16} />
                        </div>
                        <span className="row-title">{pdf.title}</span>
                      </div>
                      <div className="row-pages">{pdf.pages}</div>
                      <div className="row-size">{pdf.size}</div>
                      <div className="row-date">{pdf.date}</div>
                      <div className="row-actions">
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPdf(pdf.id);
                          }}
                          title="View PDF"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPdf(pdf.id);
                          }}
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
