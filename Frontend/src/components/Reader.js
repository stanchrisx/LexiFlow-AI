import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  Search, 
  Bookmark, 
  MessageSquare, 
  Volume2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Eye,
  EyeOff,
  Type,
  Minus,
  Plus,
  Focus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import PDFChatbot from './PDFChatbot';
import './Reader.css';

const Reader = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const pdfData = useMemo(() => location.state?.pdf || {
    id: id,
    title: 'Document.pdf',
    pages: 12,
    size: '4.2 MB'
  }, [location.state?.pdf, id]);
  
  const initialMode = location.state?.mode || 'original';
  const ocrComplete = location.state?.ocrComplete || false;

  // State management
  const [viewMode, setViewMode] = useState(initialMode);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [overlayMode, setOverlayMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light');
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Mock PDF content data
  const mockPdfContent = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= pdfData.pages; i++) {
      const hasOcr = ocrComplete || Math.random() > 0.3; // 70% of pages have OCR
      const isImageOnly = !hasOcr && Math.random() > 0.5; // Some pages are image-only
      
      pages.push({
        pageNumber: i,
        hasOcr,
        isImageOnly,
        originalContent: `Original page ${i} content - This would be the raw PDF page rendering.`,
        reflowContent: hasOcr ? [
          `This is paragraph 1 from page ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
          `This is paragraph 2 from page ${i}. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
          `This is paragraph 3 from page ${i}. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`
        ] : null,
        searchMatches: [],
        bookmarks: [],
        annotations: []
      });
    }
    return pages;
  }, [pdfData.pages, ocrComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'PageUp':
        case 'k':
        case 'K':
          e.preventDefault();
          setCurrentPage(prev => Math.max(1, prev - 1));
          break;
        case 'PageDown':
        case 'j':
        case 'J':
          e.preventDefault();
          setCurrentPage(prev => Math.min(pdfData.pages, prev + 1));
          break;
        case '/':
          e.preventDefault();
          setLeftSidebarOpen(true);
          setActiveLeftTab('search');
          setTimeout(() => {
            const searchInput = document.querySelector('.search-input');
            if (searchInput) searchInput.focus();
          }, 100);
          break;
        case 'Escape':
          e.preventDefault();
          setLeftSidebarOpen(false);
          setRightDrawerOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfData.pages]);

  const handleBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(200, prev + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(50, prev - 25));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(Math.max(1, Math.min(pdfData.pages, newPage)));
  }, [pdfData.pages]);

  const handleFontSizeIncrease = useCallback(() => {
    setFontSize(prev => Math.min(24, prev + 2));
  }, []);

  const handleFontSizeDecrease = useCallback(() => {
    setFontSize(prev => Math.max(12, prev - 2));
  }, []);

  const currentPageData = mockPdfContent[currentPage - 1];
  const canShowReflow = viewMode === 'reflow' && currentPageData?.hasOcr;
  const needsOcr = viewMode === 'reflow' && !currentPageData?.hasOcr;

  return (
    <div className={`reader ${theme} ${focusMode ? 'focus-mode' : ''}`}>
      <div className="reader-container">
        {/* Unified Header */}
        <header className="reader-header">
          <div className="header-left">
            <button className="back-button" onClick={handleBack} title="Back to Dashboard">
              <ArrowLeft size={18} />
            </button>
            <div className="document-info">
              <FileText size={18} />
              <span className="document-title">{pdfData.title}</span>
            </div>
          </div>

          <div className="header-center">
            <div className="page-controls">
              <button 
                className="page-nav-button" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous page (K)"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="page-indicator">
                <input 
                  type="number" 
                  value={currentPage} 
                  onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
                  min="1" 
                  max={pdfData.pages}
                  className="page-input"
                />
                <span className="page-total">of {pdfData.pages}</span>
              </div>
              <button 
                className="page-nav-button" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pdfData.pages}
                title="Next page (J)"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="zoom-controls">
              <button className="zoom-button" onClick={handleZoomOut} title="Zoom out">
                <ZoomOut size={16} />
              </button>
              <span className="zoom-level">{zoomLevel}%</span>
              <button className="zoom-button" onClick={handleZoomIn} title="Zoom in">
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          <div className="header-right">
            {/* Segmented Control for Original/Reflow */}
            <div className="mode-segmented-control">
              <button 
                className={`mode-button ${viewMode === 'original' ? 'active' : ''}`}
                onClick={() => setViewMode('original')}
              >
                Original
              </button>
              <button 
                className={`mode-button ${viewMode === 'reflow' ? 'active' : ''}`}
                onClick={() => setViewMode('reflow')}
              >
                Reflow
              </button>
            </div>
          </div>
        </header>

        {/* Quick Settings Strip */}
        <div className="quick-settings">
          <div className="settings-group">
            <button 
              className={`setting-button ${dyslexiaMode ? 'active' : ''}`}
              onClick={() => setDyslexiaMode(!dyslexiaMode)}
              title="Dyslexia-friendly font"
            >
              <Type size={14} />
              Dyslexia
            </button>
            
            <div className="font-size-controls">
              <button className="setting-button" onClick={handleFontSizeDecrease} title="Decrease font size">
                <Minus size={14} />
                A−
              </button>
              <button className="setting-button" onClick={handleFontSizeIncrease} title="Increase font size">
                <Plus size={14} />
                A+
              </button>
            </div>

            <button 
              className={`setting-button ${overlayMode ? 'active' : ''}`}
              onClick={() => setOverlayMode(!overlayMode)}
              title="Toggle overlay mode"
            >
              {overlayMode ? <EyeOff size={14} /> : <Eye size={14} />}
              Overlay
            </button>

            <button 
              className={`setting-button ${focusMode ? 'active' : ''}`}
              onClick={() => setFocusMode(!focusMode)}
              title="Focus mode"
            >
              <Focus size={14} />
              Focus
            </button>

            <button 
              className={`setting-button ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title="Toggle dark mode"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="reader-main">
          {/* Left Sidebar */}
          <AnimatePresence>
            {leftSidebarOpen && (
              <motion.aside 
                className="left-sidebar"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="sidebar-tabs">
                  <button 
                    className={`tab-button ${activeLeftTab === 'search' ? 'active' : ''}`}
                    onClick={() => setActiveLeftTab('search')}
                  >
                    <Search size={16} />
                    Search
                  </button>
                  <button 
                    className={`tab-button ${activeLeftTab === 'bookmarks' ? 'active' : ''}`}
                    onClick={() => setActiveLeftTab('bookmarks')}
                  >
                    <Bookmark size={16} />
                    Bookmarks
                  </button>
                </div>

                <div className="sidebar-content">
                  {activeLeftTab === 'search' && (
                    <div className="search-panel">
                      <div className="search-input-container">
                        <Search size={16} className="search-icon" />
                        <input 
                          type="text" 
                          placeholder="Search in document..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="search-input"
                        />
                      </div>
                      <div className="search-results">
                        {searchQuery ? (
                          <div className="search-result-item">
                            <div className="result-page">Page {currentPage}</div>
                            <div className="result-text">Sample search result for "{searchQuery}"</div>
                          </div>
                        ) : (
                          <div className="no-results">Enter search terms to find content</div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeLeftTab === 'bookmarks' && (
                    <div className="bookmarks-panel">
                      <div className="bookmark-item">
                        <Bookmark size={14} />
                        <span>Page 1 - Introduction</span>
                      </div>
                      <div className="bookmark-item">
                        <Bookmark size={14} />
                        <span>Page 5 - Key Concepts</span>
                      </div>
                      <div className="no-bookmarks">No bookmarks yet</div>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Content Area */}
          <main className="content-area">
            <div className="content-wrapper" style={{ fontSize: `${fontSize}px` }}>
              {needsOcr && (
                <motion.div 
                  className="ocr-banner"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="banner-content">
                    <Loader2 size={16} className="spinner" />
                    <span>Reflow not available yet — OCR in progress</span>
                    <button 
                      className="view-original-button"
                      onClick={() => setViewMode('original')}
                    >
                      View Original
                    </button>
                  </div>
                </motion.div>
              )}

              <div className={`page-content ${viewMode} ${dyslexiaMode ? 'dyslexia' : ''}`}>
                {viewMode === 'original' ? (
                  <div className="original-page" style={{ transform: `scale(${zoomLevel / 100})` }}>
                    <div className="page-image">
                      <div className="page-placeholder">
                        <FileText size={48} />
                        <p>Original Page {currentPage}</p>
                        <p className="page-description">{currentPageData?.originalContent}</p>
                      </div>
                    </div>
                  </div>
                ) : canShowReflow ? (
                  <div className="reflow-content">
                    {currentPageData.reflowContent.map((paragraph, index) => (
                      <motion.p 
                        key={index}
                        className="reflow-paragraph"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </main>

          {/* Right Drawer */}
          <AnimatePresence>
            {rightDrawerOpen && (
              <motion.aside 
                className="right-drawer"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="drawer-header">
                  <h3>Annotations</h3>
                  <button 
                    className="close-drawer"
                    onClick={() => setRightDrawerOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="drawer-content">
                  <div className="annotation-item">
                    <MessageSquare size={14} />
                    <div className="annotation-text">Sample annotation on page {currentPage}</div>
                  </div>
                  <div className="no-annotations">No annotations yet</div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom TTS Bar */}
        <div className="tts-bar">
          <div className="tts-controls">
            <button className="tts-button" title="Previous">
              <SkipBack size={16} />
            </button>
            <button 
              className="tts-button primary" 
              onClick={() => setTtsPlaying(!ttsPlaying)}
              title={ttsPlaying ? 'Pause' : 'Play'}
            >
              {ttsPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className="tts-button" title="Next">
              <SkipForward size={16} />
            </button>
          </div>
          
          <div className="tts-info">
            <Volume2 size={16} />
            <span className="tts-text">
              {ttsPlaying ? 'Reading page content...' : 'Text-to-Speech ready'}
            </span>
          </div>

          <div className="tts-actions">
            <button 
              className="toggle-button"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              title="Toggle search (Press /)"
            >
              <Search size={16} />
            </button>
            <button 
              className="toggle-button"
              onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
              title="Toggle annotations"
            >
              <MessageSquare size={16} />
            </button>
            <button 
              className="toggle-button"
              onClick={() => setChatbotOpen(!chatbotOpen)}
              title="AI Assistant"
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>

        {/* PDF Chatbot */}
        <PDFChatbot 
          pdfData={pdfData}
          currentPage={currentPage}
          isOpen={chatbotOpen}
          onToggle={() => setChatbotOpen(!chatbotOpen)}
        />
      </div>
    </div>
  );
};

export default Reader;
