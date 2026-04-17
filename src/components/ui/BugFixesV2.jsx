/**
 * Atlas Core Bug Fixes v2.0
 * Comprehensive fixes for image handling, empty/error states, form inputs, and touch targets
 * Built from scratch with the new design system
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  FileText,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Eye
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// ========================================
// IMAGE HANDLING FIXES
// ========================================

// Smart Image Component with Error Handling
function SmartImage({ 
  src, 
  alt, 
  className = '', 
  fallback = '/api/placeholder/400/300',
  onLoad,
  onError,
  lazy = true,
  aspectRatio = 'auto'
}) {
  const [imageState, setImageState] = useState('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef(null);

  useEffect(() => {
    setCurrentSrc(src);
    setImageState('loading');
  }, [src]);

  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setImageState('loading');
    } else {
      setImageState('error');
      onError?.();
    }
  };

  const handleRetry = () => {
    setImageState('loading');
    setCurrentSrc(src);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-gray-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      )}
      
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm mb-3">Failed to load image</p>
            <button 
              onClick={handleRetry}
              className="btn btn-secondary text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        style={{ aspectRatio }}
      />
    </div>
  );
}

// Image Upload Component with Progress
function ImageUpload({ 
  onUpload, 
  accept = 'image/*', 
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  preview = true,
  className = ''
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    setError('');
    
    for (let file of files) {
      // Validate file size
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`File ${file.name} is not an image`);
        return;
      }
      
      setUploading(true);
      setProgress(0);
      
      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          setProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const result = await onUpload(file);
        setUploadedFiles(prev => multiple ? [...prev, result] : [result]);
      } catch (err) {
        setError(`Failed to upload ${file.name}: ${err.message}`);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(multiple ? files : files.slice(0, 1));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(multiple ? files : files.slice(0, 1));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center transition-colors hover:border-green-500/50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-gray-600" />
        </div>
        
        <p className="text-white font-medium mb-2">
          {uploading ? 'Uploading...' : 'Drop images here or click to browse'}
        </p>
        
        {!uploading && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
          >
            <Camera className="w-4 h-4" />
            Select Images
          </button>
        )}
        
        {uploading && (
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">{progress}% complete</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {uploadedFiles.length > 0 && preview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <SmartImage 
                src={file.url} 
                alt={`Upload ${index + 1}`}
                className="w-full h-32 rounded-xl"
              />
              <button 
                onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========================================
// EMPTY & ERROR STATES
// ========================================

// Empty State Component
function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  actionLabel,
  illustration = null,
  className = ''
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {illustration ? (
        <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
          {illustration}
        </div>
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
          {icon || <FileText className="w-12 h-12 text-gray-600" />}
        </div>
      )}
      
      <h3 className="headline-md text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      
      {action && (
        <button onClick={action} className="btn btn-primary">
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}

// Error State Component
function ErrorState({ 
  title, 
  description, 
  onRetry, 
  retryLabel = 'Try Again',
  showIcon = true,
  className = ''
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {showIcon && (
        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
      )}
      
      <h3 className="headline-md text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      
      <button onClick={onRetry} className="btn btn-secondary">
        <RefreshCw className="w-4 h-4" />
        {retryLabel}
      </button>
    </div>
  );
}

// Loading State Component
function LoadingState({ 
  title = 'Loading...', 
  description = 'Please wait',
  showSpinner = true,
  className = ''
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {showSpinner && (
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      )}
      
      <h3 className="headline-md text-white mb-3">{title}</h3>
      <p className="text-gray-400 max-w-md mx-auto">{description}</p>
    </div>
  );
}

// Network Status Component
function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Get connection type if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setConnectionType(connection.effectiveType || 'unknown');
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50">
      <div className="card bg-red-500/10 border-red-500/30">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <p className="text-white font-medium">No Internet Connection</p>
            <p className="text-gray-400 text-sm">Please check your connection and try again</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// FORM INPUTS WITH VALIDATION
// ========================================

// Enhanced Input Component
function EnhancedInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  icon,
  helperText,
  validation,
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = () => {
    setFocused(true);
    inputRef.current?.focus();
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-11 px-4 rounded-xl border transition-all duration-200 ${
            icon ? 'pl-10' : ''
          } ${type === 'password' ? 'pr-10' : ''} ${
            error
              ? 'border-red-500 bg-red-500/5 text-white'
              : focused
              ? 'border-green-500 bg-green-500/5 text-white'
              : 'border-gray-700 bg-gray-800 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <p className="text-gray-400 text-sm">{helperText}</p>
      )}
    </div>
  );
}

// Number Input Component
function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  error,
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const handleIncrement = () => {
    const newValue = Math.min(max !== undefined ? max : Infinity, (value || 0) + step);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min !== undefined ? min : 0, (value || 0) - step);
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={min !== undefined && value <= min}
          className="w-10 h-10 rounded-xl border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">-</span>
        </button>
        
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          min={min}
          max={max}
          step={step}
          className={`flex-1 h-10 px-4 rounded-xl border text-center font-bold transition-all duration-200 ${
            error
              ? 'border-red-500 bg-red-500/5 text-white'
              : focused
              ? 'border-green-500 bg-green-500/5 text-white'
              : 'border-gray-700 bg-gray-800 text-white'
          }`}
          {...props}
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
          className="w-10 h-10 rounded-xl border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">+</span>
        </button>
        
        {unit && (
          <span className="text-gray-400 font-medium min-w-[3rem] text-right">{unit}</span>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ========================================
// TOUCH TARGET FIXES
// ========================================

// Touch-friendly Button Component
function TouchButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };

  const variants = {
    primary: 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600',
    secondary: 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700',
    ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-gray-800',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizes[size]}
        ${variants[variant]}
        rounded-xl font-medium transition-all duration-200
        flex items-center justify-center gap-2
        min-w-[44px] min-h-[44px]
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}

// Touch-friendly Card Component
function TouchCard({
  children,
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        card cursor-pointer transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:-translate-y-1 active:scale-95'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// ========================================
// ACCESSIBILITY FIXES
// ========================================

// Focus Management Hook
function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState(null);

  const trapFocus = (containerRef) => {
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements?.length > 0) {
      focusableElements[0].focus();
      setFocusedElement(focusableElements[0]);
    }
  };

  const restoreFocus = () => {
    if (focusedElement) {
      focusedElement.focus();
      setFocusedElement(null);
    }
  };

  return { trapFocus, restoreFocus };
}

// Screen Reader Announcements
function useScreenReader() {
  const announce = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
}

export {
  SmartImage,
  ImageUpload,
  EmptyState,
  ErrorState,
  LoadingState,
  NetworkStatus,
  EnhancedInput,
  NumberInput,
  TouchButton,
  TouchCard,
  useFocusManagement,
  useScreenReader
};
