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
  Type,
  Minus,
  Plus,
  Focus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X
} from 'lucide-react';
import PDFChatbot from './PDFChatbot';
import { pdfAPI } from '../services/api';
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
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState('default'); // default, beige, sepia, dark-blue, mint
  const [fontFamily, setFontFamily] = useState('default'); // default, dyslexic, serif, mono
  const [focusMode, setFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(true);

  // Fetch document data from backend
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoadingDocument(true);
        const docId = id;
        const data = await pdfAPI.getDocument(docId);
        setDocumentData(data);
      } catch (error) {
        console.error('Failed to load document:', error);
        // If fails, will show mock data
      } finally {
        setLoadingDocument(false);
      }
    };

    if (id) {
      fetchDocument();
    } else {
      setLoadingDocument(false);
    }
  }, [id]);

  // Get PDF content from real data or fallback to mock
  const pdfContent = useMemo(() => {
    if (documentData && documentData.pages) {
      return documentData.pages;
    }
    
    // Fallback to mock data
    const pages = [];
    for (let i = 1; i <= pdfData.pages; i++) {
      const hasOcr = ocrComplete || Math.random() > 0.3;
      pages.push({
        page_number: i,
        content_blocks: hasOcr ? [
          {
            type: 'paragraph',
            content: `This is paragraph 1 from page ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
            page_number: i,
            position: { x: 50, y: 100, width: 500, height: 50 },
            order: 0,
            is_editable: true
          },
          {
            type: 'paragraph',
            content: `This is paragraph 2 from page ${i}. Ut enim ad minim veniam, quis nostrud exercitation.`,
            page_number: i,
            position: { x: 50, y: 160, width: 500, height: 50 },
            order: 1,
            is_editable: true
          }
        ] : [],
        original_image: null,
        has_ocr: hasOcr,
        ocr_confidence: hasOcr ? 0.95 : null
      });
    }
    return pages;
  }, [documentData, pdfData.pages, ocrComplete]);

  // Search functionality
  const performSearch = useCallback(() => {
    if (!searchQuery.trim() || !documentData?.pages) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const query = searchQuery.toLowerCase();

    documentData.pages.forEach(page => {
      page.content_blocks?.forEach(block => {
        if (block.type === 'paragraph' || block.type === 'text' || block.type === 'heading') {
          const content = block.content.toLowerCase();
          let index = content.indexOf(query);
          
          while (index !== -1) {
            results.push({
              pageNumber: page.page_number,
              blockOrder: block.order,
              matchIndex: index,
              matchLength: searchQuery.length,
              fullContent: block.content,
              context: block.content.substring(Math.max(0, index - 40), Math.min(block.content.length, index + query.length + 40))
            });
            index = content.indexOf(query, index + 1);
          }
        }
      });
    });

    setSearchResults(results);
    setCurrentSearchIndex(0);
    
    // Jump to first result
    if (results.length > 0) {
      setCurrentPage(results[0].pageNumber);
    }
  }, [searchQuery, documentData]);

  // Helper function to highlight search text in content
  const highlightSearchText = useCallback((text, blockOrder, pageNumber) => {
    if (!searchQuery || searchResults.length === 0) {
      return text;
    }

    // Find if this block has matches on the current page
    const blockMatches = searchResults.filter(
      result => result.pageNumber === pageNumber && result.blockOrder === blockOrder
    );

    if (blockMatches.length === 0) {
      return text;
    }

    // Sort matches by index in reverse to avoid offset issues
    const sortedMatches = [...blockMatches].sort((a, b) => b.matchIndex - a.matchIndex);
    
    let highlightedText = text;
    sortedMatches.forEach((match, idx) => {
      const isCurrentMatch = searchResults[currentSearchIndex]?.pageNumber === pageNumber && 
                             searchResults[currentSearchIndex]?.blockOrder === blockOrder &&
                             searchResults[currentSearchIndex]?.matchIndex === match.matchIndex;
      
      const before = highlightedText.substring(0, match.matchIndex);
      const matchText = highlightedText.substring(match.matchIndex, match.matchIndex + match.matchLength);
      const after = highlightedText.substring(match.matchIndex + match.matchLength);
      
      const highlightClass = isCurrentMatch ? 'highlight-current' : 'highlight-match';
      highlightedText = `${before}<mark class="${highlightClass}">${matchText}</mark>${after}`;
    });

    return highlightedText;
  }, [searchQuery, searchResults, currentSearchIndex]);

  // Navigate search results
  const goToNextResult = useCallback(() => {
    if (searchResults.length > 0) {
      const nextIndex = (currentSearchIndex + 1) % searchResults.length;
      setCurrentSearchIndex(nextIndex);
      setCurrentPage(searchResults[nextIndex].pageNumber);
    }
  }, [searchResults, currentSearchIndex]);

  const goToPrevResult = useCallback(() => {
    if (searchResults.length > 0) {
      const prevIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
      setCurrentSearchIndex(prevIndex);
      setCurrentPage(searchResults[prevIndex].pageNumber);
    }
  }, [searchResults, currentSearchIndex]);

  // Auto-scroll to current highlight
  useEffect(() => {
    if (searchResults.length > 0 && currentSearchIndex >= 0) {
      setTimeout(() => {
        const currentHighlight = document.querySelector('.highlight-current');
        if (currentHighlight) {
          currentHighlight.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 300); // Small delay to allow page change animation
    }
  }, [currentSearchIndex, searchResults, currentPage]);

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
          setShowSearchPopup(true);
          setTimeout(() => {
            const searchInput = document.querySelector('.search-popup-input');
            if (searchInput) searchInput.focus();
          }, 100);
          break;
        case 'Escape':
          e.preventDefault();
          setShowSearchPopup(false);
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

  const currentPageData = pdfContent[currentPage - 1];
  const hasContent = currentPageData?.content_blocks && currentPageData.content_blocks.length > 0;
  const canShowReflow = viewMode === 'reflow' && hasContent;
  const needsOcr = viewMode === 'reflow' && !hasContent;

  // TTS Functionality
  const handleTTSToggle = useCallback(() => {
    if (ttsPlaying) {
      // Stop speech
      window.speechSynthesis.cancel();
      setTtsPlaying(false);
    } else {
      // Start speech
      if (currentPageData?.content_blocks) {
        const textBlocks = currentPageData.content_blocks
          .filter(block => block.type === 'paragraph' || block.type === 'text' || block.type === 'heading')
          .sort((a, b) => a.order - b.order);
        
        const fullText = textBlocks.map(block => block.content).join('. ');
        
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onend = () => {
          setTtsPlaying(false);
        };
        
        window.speechSynthesis.speak(utterance);
        setTtsPlaying(true);
      }
    }
  }, [ttsPlaying, currentPageData]);


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
            {/* Font Family Selector */}
            <div className="setting-dropdown">
              <button 
                className={`setting-button ${fontFamily !== 'default' ? 'active' : ''}`}
                onClick={() => setShowFontMenu(!showFontMenu)}
                title="Font family"
              >
                <Type size={14} />
                Font
              </button>
              {showFontMenu && (
                <div className="dropdown-menu">
                  <button 
                    className={fontFamily === 'default' ? 'active' : ''}
                    onClick={() => { setFontFamily('default'); setShowFontMenu(false); }}
                  >
                    Default
                  </button>
                  <button 
                    className={fontFamily === 'dyslexic' ? 'active' : ''}
                    onClick={() => { setFontFamily('dyslexic'); setShowFontMenu(false); }}
                  >
                    OpenDyslexic
                  </button>
                  <button 
                    className={fontFamily === 'serif' ? 'active' : ''}
                    onClick={() => { setFontFamily('serif'); setShowFontMenu(false); }}
                  >
                    Serif
                  </button>
                  <button 
                    className={fontFamily === 'mono' ? 'active' : ''}
                    onClick={() => { setFontFamily('mono'); setShowFontMenu(false); }}
                  >
                    Monospace
                  </button>
                </div>
              )}
            </div>
            
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

            {/* Background Theme Selector */}
            <div className="setting-dropdown">
              <button 
                className={`setting-button ${backgroundTheme !== 'default' ? 'active' : ''}`}
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                title="Background theme"
              >
                {backgroundTheme === 'default' ? '🎨' : '🌈'}
                Theme
              </button>
              {showThemeMenu && (
                <div className="dropdown-menu">
                  <button 
                    className={backgroundTheme === 'default' ? 'active' : ''}
                    onClick={() => { setBackgroundTheme('default'); setShowThemeMenu(false); }}
                  >
                    <span className="theme-dot" style={{background: '#ffffff'}}></span>
                    Default
                  </button>
                  <button 
                    className={backgroundTheme === 'beige' ? 'active' : ''}
                    onClick={() => { setBackgroundTheme('beige'); setShowThemeMenu(false); }}
                  >
                    <span className="theme-dot" style={{background: '#fdfbf7'}}></span>
                    Beige
                  </button>
                  <button 
                    className={backgroundTheme === 'sepia' ? 'active' : ''}
                    onClick={() => { setBackgroundTheme('sepia'); setShowThemeMenu(false); }}
                  >
                    <span className="theme-dot" style={{background: '#f4ecd8'}}></span>
                    Sepia
                  </button>
                  <button 
                    className={backgroundTheme === 'mint' ? 'active' : ''}
                    onClick={() => { setBackgroundTheme('mint'); setShowThemeMenu(false); }}
                  >
                    <span className="theme-dot" style={{background: '#e8f5f1'}}></span>
                    Mint
                  </button>
                  <button 
                    className={backgroundTheme === 'dark-blue' ? 'active' : ''}
                    onClick={() => { setBackgroundTheme('dark-blue'); setShowThemeMenu(false); }}
                  >
                    <span className="theme-dot" style={{background: '#1e2a3a'}}></span>
                    Night Blue
                  </button>
                </div>
              )}
            </div>

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
          <main className={`content-area theme-${backgroundTheme} font-${fontFamily}`}>
            {/* Focus Mode - Line highlighting overlay */}
            {focusMode && (
              <div className="focus-overlay">
                <div className="focus-dimmer focus-top"></div>
                <div className="focus-highlight"></div>
                <div className="focus-dimmer focus-bottom"></div>
              </div>
            )}
            
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

              <div className={`page-content ${viewMode}`}>
                {loadingDocument ? (
                  <div className="loading-content">
                    <Loader2 size={48} className="spinner" />
                    <p>Loading document...</p>
                  </div>
                ) : viewMode === 'original' ? (
                  <div className="original-page" style={{ transform: `scale(${zoomLevel / 100})` }}>
                    {currentPageData?.original_image ? (
                      <img 
                        src={currentPageData.original_image} 
                        alt={`Page ${currentPage}`}
                        className="page-image-render"
                      />
                    ) : (
                      <div className="page-image">
                        <div className="page-placeholder">
                          <FileText size={48} />
                          <p>Original Page {currentPage}</p>
                          <p className="page-description">PDF page rendering</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : canShowReflow ? (
                  <div className="reflow-content">
                    {currentPageData.content_blocks && currentPageData.content_blocks
                      .sort((a, b) => a.order - b.order)
                      .map((block, index) => {
                        // Render text blocks (paragraph, text, heading)
                        if (block.type === 'paragraph' || block.type === 'text' || block.type === 'heading') {
                          return (
                    <motion.div
                      key={`${block.page_number}-${block.order}`}
                      className={`content-block ${block.type}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <p 
                        className="reflow-paragraph"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchText(block.content, block.order, currentPage)
                        }}
                      />
                      {block.metadata?.ocr && (
                        <span className="ocr-badge" title={`OCR Confidence: ${(block.metadata.confidence || 0).toFixed(0)}%`}>
                          OCR
                        </span>
                      )}
                    </motion.div>
                          );
                        }
                        
                        // Render image blocks
                        if (block.type === 'image') {
                          return (
                            <motion.div
                              key={`${block.page_number}-${block.order}`}
                              className="content-block image"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <img 
                                src={block.content} 
                                alt={`Page ${block.page_number} content`}
                                className="content-image"
                              />
                            </motion.div>
                          );
                        }
                        
                        return null;
                      })}
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
              onClick={handleTTSToggle}
              title={ttsPlaying ? 'Stop Reading' : 'Read Aloud'}
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

        {/* Search Popup */}
        {showSearchPopup && (
          <motion.div 
            className="search-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSearchPopup(false)}
          >
            <motion.div 
              className="search-popup"
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="search-popup-header">
                <Search size={20} />
                <h3>Search in Document</h3>
                <button 
                  className="search-popup-close"
                  onClick={() => setShowSearchPopup(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="search-popup-body">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon-input" />
                  <input
                    type="text"
                    className="search-popup-input"
                    placeholder="Type to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        performSearch();
                      }
                    }}
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button 
                  className="search-btn"
                  onClick={performSearch}
                  disabled={!searchQuery.trim()}
                >
                  Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results-section">
                  <div className="search-results-header">
                    <span className="results-count">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </span>
                    <div className="search-navigation">
                      <span className="current-result">
                        {currentSearchIndex + 1} / {searchResults.length}
                      </span>
                      <button 
                        className="nav-btn"
                        onClick={goToPrevResult}
                        title="Previous result"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        className="nav-btn"
                        onClick={goToNextResult}
                        title="Next result"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="search-results-list">
                    {searchResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`search-result-item ${index === currentSearchIndex ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentSearchIndex(index);
                          setCurrentPage(result.pageNumber);
                        }}
                      >
                        <div className="result-page-number">Page {result.pageNumber}</div>
                        <div className="result-context">
                          ...{result.context}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="no-results">
                  <Search size={32} />
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}

              <div className="search-popup-footer">
                <span className="shortcut-hint">Press <kbd>/</kbd> to search • <kbd>Esc</kbd> to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Reader;
