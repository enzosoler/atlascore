/**
 * Atlas Core Authentication v2.0
 * Premium authentication flow with new design system
 * Built from scratch with the new design system
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Activity,
  Calendar,
  Trophy
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock authentication data
const mockAuthData = {
  socialProviders: [
    { name: 'Google', icon: 'G', color: 'blue', colorHex: '#4285F4' },
    { name: 'Apple', icon: 'A', color: 'gray', colorHex: '#000000' },
    { name: 'Facebook', icon: 'f', color: 'blue', colorHex: '#1877F2' }
  ],
  benefits: [
    { icon: <Trophy className="w-5 h-5" />, title: "Track Progress", description: "Monitor your fitness journey with detailed analytics" },
    { icon: <Zap className="w-5 h-5" />, title: "AI Coaching", description: "Get personalized workout and nutrition plans" },
    { icon: <Heart className="w-5 h-5" />, title: "Health Insights", description: "Understand your body with advanced metrics" },
    { icon: <Activity className="w-5 h-5" />, title: "Community", description: "Connect with fitness enthusiasts worldwide" }
  ]
};

// Social Login Button Component
function SocialLoginButton({ provider, onClick }) {
  return (
    <button
      onClick={() => onClick(provider.name)}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 group"
    >
      <div 
        className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: provider.colorHex }}
      >
        {provider.icon}
      </div>
      <span className="text-gray-300 group-hover:text-white transition-colors">
        Continue with {provider.name}
      </span>
    </button>
  );
}

// Input Field Component
function InputField({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  error, 
  icon, 
  showPasswordToggle = false,
  onTogglePassword 
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
    onTogglePassword?.();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={showPasswordToggle && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-12 px-4 rounded-xl bg-gray-800 border ${
            error ? 'border-red-500' : 'border-gray-700'
          } text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors ${
            icon ? 'pl-12' : ''
          } ${showPasswordToggle ? 'pr-12' : ''}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
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

// Auth Step Component
function AuthStep({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="headline-lg text-white mb-2">{title}</h1>
        <p className="text-gray-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Success Message Component
function SuccessMessage({ message, onContinue }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="headline-md text-white mb-2">Success!</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <button onClick={onContinue} className="btn btn-primary">
        Continue
      </button>
    </div>
  );
}

// Benefits Section Component
function BenefitsSection() {
  return (
    <div className="card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="headline-sm text-white mb-2">Why Choose Atlas Core?</h3>
        <p className="text-gray-400 text-sm">Join thousands achieving their fitness goals</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAuthData.benefits.map((benefit, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-green-400 flex-shrink-0">
              {benefit.icon}
            </div>
            <div>
              <h4 className="text-white font-medium text-sm mb-1">{benefit.title}</h4>
              <p className="text-gray-400 text-xs">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Auth Component
function AuthV2() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const mode = searchParams.get('mode') || 'login';
  const nextUrl = searchParams.get('next');

  useEffect(() => {
    setCurrentStep(mode);
  }, [mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (currentStep === 'signup') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setShowSuccess(true);
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    
    // Simulate social login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setShowSuccess(true);
  };

  const handleSuccess = () => {
    if (nextUrl) {
      navigate(nextUrl);
    } else {
      navigate('/dashboard');
    }
  };

  const switchMode = (mode) => {
    setCurrentStep(mode);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
    setErrors({});
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-base-0 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SuccessMessage 
            message={`Successfully ${currentStep === 'signin' ? 'signed in' : 'signed up'}! Redirecting to your dashboard...`}
            onContinue={handleSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-0 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="display-sm text-white">Atlas Core</h2>
          <p className="text-gray-400">Premium Fitness Tracker</p>
        </div>

        {/* Auth Form */}
        <div className="card">
          {currentStep === 'signin' && (
            <AuthStep 
              title="Welcome Back" 
              subtitle="Sign in to continue your fitness journey"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  error={errors.email}
                  icon={<Mail className="w-4 h-4" />}
                  onTogglePassword={() => {}}
                />
                
                <InputField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  error={errors.password}
                  icon={<Lock className="w-4 h-4" />}
                  showPasswordToggle={true}
                  onTogglePassword={() => {}}
                />
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-800" />
                    Remember me
                  </label>
                  <button type="button" className="text-green-400 text-sm hover:text-green-300">
                    Forgot password?
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-base-0 text-gray-400">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {mockAuthData.socialProviders.map((provider) => (
                    <SocialLoginButton 
                      key={provider.name}
                      provider={provider}
                      onClick={handleSocialLogin}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => switchMode('signup')}
                    className="text-green-400 hover:text-green-300 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </AuthStep>
          )}
          
          {currentStep === 'signup' && (
            <AuthStep 
              title="Create Account" 
              subtitle="Start your fitness transformation today"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your name"
                  error={errors.name}
                  icon={<User className="w-4 h-4" />}
                  onTogglePassword={() => {}}
                />
                
                <InputField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  error={errors.email}
                  icon={<Mail className="w-4 h-4" />}
                  onTogglePassword={() => {}}
                />
                
                <InputField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password"
                  error={errors.password}
                  icon={<Lock className="w-4 h-4" />}
                  showPasswordToggle={true}
                  onTogglePassword={() => {}}
                />
                
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword}
                  icon={<Lock className="w-4 h-4" />}
                  showPasswordToggle={true}
                  onTogglePassword={() => {}}
                />
                
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-800" />
                  <label className="text-sm text-gray-300">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-base-0 text-gray-400">Or sign up with</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {mockAuthData.socialProviders.map((provider) => (
                    <SocialLoginButton 
                      key={provider.name}
                      provider={provider}
                      onClick={handleSocialLogin}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <button 
                    onClick={() => switchMode('signin')}
                    className="text-green-400 hover:text-green-300 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </AuthStep>
          )}
        </div>
        
        {/* Benefits Section */}
        <BenefitsSection />
        
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
          <Shield className="w-3 h-3" />
          <span>Secured with industry-standard encryption</span>
        </div>
      </div>
    </div>
  );
}

export default AuthV2;
