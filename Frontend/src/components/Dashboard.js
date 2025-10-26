import React, { useState, useEffect } from 'react';
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
import { authAPI, pdfAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfs, setPdfs] = useState([]);
  const [uploading, setUploading] = useState(false);

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ];

  const filteredPdfs = pdfs.filter(pdf =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!authAPI.isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        const profile = await authAPI.getProfile();
        setUser(profile);
        
        // Fetch user's PDF documents
        const documents = await pdfAPI.getDocuments();
        const formattedDocs = documents.map((doc, index) => ({
          id: doc.id,
          title: doc.title,
          pages: doc.total_pages,
          date: formatDate(doc.uploaded_at),
          thumbnail: gradients[index % gradients.length],
          size: formatFileSize(doc.file_size)
        }));
        setPdfs(formattedDocs);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (error.status === 401) {
          authAPI.logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const handleUpload = () => {
    // Create a file input element and trigger click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.multiple = false;
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      try {
        console.log('Uploading file:', file.name);
        const response = await pdfAPI.upload(file);
        console.log('Upload response:', response);
        
        // Add the new document to the list
        const newDoc = {
          id: response.document_id,
          title: response.title,
          pages: response.total_pages,
          date: 'Just now',
          thumbnail: gradients[pdfs.length % gradients.length],
          size: formatFileSize(file.size)
        };
        setPdfs([newDoc, ...pdfs]);
        
        // Navigate to OCR processing
        navigate('/ocr-processing', { 
          state: { 
            pdf: newDoc 
          } 
        });
      } catch (error) {
        console.error('Failed to upload PDF:', error);
        alert('Failed to upload PDF. Please try again.');
      } finally {
        setUploading(false);
      }
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

  const handleDownloadPdf = async (pdfId) => {
    try {
      console.log('Downloading PDF:', pdfId);
      // In a real implementation, you'd create a download endpoint
      // For now, we'll just show a message
      alert('Download functionality will be implemented with a dedicated endpoint');
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
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
            <button 
              className="upload-button primary" 
              onClick={handleUpload}
              disabled={uploading}
            >
              <Upload size={18} />
              <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <motion.div
              className="loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ margin: '0 auto' }}
            />
          </div>
        ) : (
          <>
            <div className="content-header">
              <h1 className="welcome-title">Welcome, {user?.full_name || 'User'}!</h1>
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
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
