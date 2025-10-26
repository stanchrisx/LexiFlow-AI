import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  X, 
  Eye,
  Check
} from 'lucide-react';
import './OCRProcessing.css';

const OCRProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get PDF data from navigation state or use mock data
  const pdfData = useMemo(() => location.state?.pdf || {
    id: 1,
    title: 'Scanned Document.pdf',
    pages: 12,
    size: '4.2 MB'
  }, [location.state?.pdf]);

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Professional processing steps with Apple-style messaging
  const processingSteps = [
    { message: "Analyzing document structure", subtext: "Identifying text regions and layout" },
    { message: "Extracting content", subtext: "Processing pages and images" },
    { message: "Applying optical recognition", subtext: "Converting images to searchable text" },
    { message: "Optimizing for readability", subtext: "Enhancing text flow and formatting" },
    { message: "Finalizing document", subtext: "Preparing enhanced reading experience" },
    { message: "Ready to read", subtext: "Your document has been optimized" }
  ];

  // Auto-start processing with Swiggy-style progress
  useEffect(() => {
    const totalDuration = 3000; // 3 seconds total
    const stepDuration = totalDuration / processingSteps.length;
    
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (totalDuration / 100));
        if (newProgress >= 100) {
          clearInterval(progressTimer);
          setIsComplete(true);
          // Auto-navigate to reader after completion
          setTimeout(() => {
            navigate(`/reader/${pdfData.id}`, { 
              state: { 
                pdf: pdfData, 
                mode: 'reflow',
                ocrComplete: true 
              } 
            });
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    // Update step messages
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        const newStep = prev + 1;
        if (newStep >= processingSteps.length) {
          clearInterval(stepTimer);
          return processingSteps.length - 1;
        }
        return newStep;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [pdfData, navigate, processingSteps.length]);

  const currentStepData = processingSteps[currentStep] || processingSteps[0];

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleContinueOriginal = () => {
    navigate(`/reader/${pdfData.id}`, { 
      state: { 
        pdf: pdfData, 
        mode: 'original' 
      } 
    });
  };

  return (
    <div className="ocr-processing">
      <div className="ocr-container">
        {/* Header */}
        <motion.div 
          className="ocr-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-content">
            <div className="document-info">
              <FileText className="document-icon" size={24} />
              <div className="document-details">
                <h1 className="document-title">{pdfData.title}</h1>
                <p className="document-meta">{pdfData.pages} pages • {pdfData.size}</p>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={handleCancel}
              aria-label="Close OCR processing"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>

        {/* Main Content - Apple Liquid Glass Style */}
        <div className="ocr-main">
          <motion.div 
            className="glass-progress-section"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Liquid Glass Card */}
            <div className="glass-card">
              {/* Animated Processing Indicator */}
              <div className="processing-indicator">
                <motion.div 
                  className="liquid-orb"
                  animate={{ 
                    scale: isComplete ? [1, 1.1, 1] : [1, 1.05, 1],
                    opacity: isComplete ? 1 : [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: isComplete ? 0.6 : 2,
                    repeat: isComplete ? 0 : Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="orb-glow" />
              </div>

              {/* Current Step Message */}
              <motion.div 
                className="step-content"
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <h2 className="step-title">{currentStepData.message}</h2>
                <p className="step-subtitle">{currentStepData.subtext}</p>
              </motion.div>

              {/* Liquid Progress Bar */}
              <div className="liquid-progress-container">
                <div className="progress-track">
                  <motion.div 
                    className="liquid-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                  <div className="progress-shimmer" />
                </div>
                <div className="progress-labels">
                  <span className="progress-text">Processing</span>
                  <span className="progress-percentage">{Math.round(progress)}%</span>
                </div>
              </div>

              {/* Minimalist Step Indicators */}
              <div className="step-indicators">
                {processingSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className={`step-indicator ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    {index < currentStep && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <Check size={8} strokeWidth={4} />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Completion State */}
              {isComplete && (
                <motion.div 
                  className="completion-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <motion.div 
                    className="completion-icon"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      ease: [0.175, 0.885, 0.32, 1.275],
                      delay: 0.1
                    }}
                  >
                    <Check size={24} strokeWidth={3} />
                  </motion.div>
                  <p className="completion-text">Opening enhanced document</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Simple Actions */}
        {!isComplete && (
          <motion.div 
            className="ocr-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button 
              className="action-button outline"
              onClick={handleContinueOriginal}
            >
              <Eye size={16} />
              Skip & View Original
            </button>
            
            <button 
              className="action-button danger"
              onClick={handleCancel}
            >
              <X size={16} />
              Cancel
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OCRProcessing;
