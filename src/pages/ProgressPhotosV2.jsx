/**
 * Atlas Core Progress Photos v2.0
 * Premium progress photo tracking and comparison
 * Built from scratch with the new design system
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Plus,
  Trash2,
  Eye,
  Download,
  Share2,
  Calendar,
  TrendingUp,
  Clock,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Filter,
  Search,
  Zap,
  Award,
  Target,
  Sparkles
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock progress photos data
const mockPhotos = [
  {
    id: 1,
    date: '2024-04-01',
    poses: [
      { type: 'front', url: '/api/placeholder/400/600', uploaded: true },
      { type: 'side', url: '/api/placeholder/400/600', uploaded: true },
      { type: 'back', url: '/api/placeholder/400/600', uploaded: true },
      { type: 'pose', url: '/api/placeholder/400/600', uploaded: false }
    ],
    notes: 'Feeling leaner, shoulders looking more defined',
    weight: 181.0,
    bodyFat: 16.1
  },
  {
    id: 2,
    date: '2024-03-01',
    poses: [
      { type: 'front', url: '/api/placeholder/400/600', uploaded: true },
      { type: 'side', url: '/api/placeholder/400/600', uploaded: true },
      { type: 'back', url: '/api/placeholder/400/600', uploaded: true },
      { type: 'pose', url: '/api/placeholder/400/600', uploaded: true }
    ],
    notes: 'Starting to see good progress in upper body',
    weight: 182.4,
    bodyFat: 16.8
  },
  {
    id: 3,
    date: '2024-02-01',
    poses: [
      { type: 'front', url: '/api/placeholder/400/600', uploaded: true },
      { type: 'side', url: '/api/placeholder/400/600', uploaded: true },
      { type: 'back', url: '/api/placeholder/400/600', uploaded: false },
      { type: 'pose', url: '/api/placeholder/400/600', uploaded: false }
    ],
    notes: 'Consistency is paying off',
    weight: 183.8,
    bodyFat: 17.2
  }
];

const POSES = [
  { key: 'front', label: 'Front', hint: 'Arms at sides, looking forward' },
  { key: 'side', label: 'Side', hint: 'Right profile, relaxed' },
  { key: 'back', label: 'Back', hint: 'Back to camera, arms down' },
  { key: 'pose', label: 'Flex', hint: 'Your choice of pose' }
];

// Photo Comparison Slider Component
function ComparisonSlider({ beforePhoto, afterPhoto, beforeDate, afterDate }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">Visual Comparison</span>
          </div>
          <span className="text-gray-400 text-sm">Drag to compare</span>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative aspect-[3/4] cursor-ew-resize select-none"
        onMouseMove={handleMouseMove}
        onMouseDown={() => {
          const handleMouseMove = (e) => {
            const rect = containerRef.current?.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = (x / rect.width) * 100;
            setSliderPosition(Math.max(0, Math.min(100, percentage)));
          };
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        onTouchMove={handleTouchMove}
      >
        {/* After photo (background) */}
        <div className="absolute inset-0">
          <img 
            src={afterPhoto} 
            alt="After" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Before photo (foreground with clip) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={beforePhoto} 
            alt="Before" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Slider handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-gray-800 -mr-1" />
            <ChevronRight className="w-4 h-4 text-gray-800 -ml-1" />
          </div>
        </div>
        
        {/* Date labels */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-xs font-medium">Before · {beforeDate}</span>
        </div>
        <div className="absolute bottom-4 right-4 bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-xs font-medium">After · {afterDate}</span>
        </div>
      </div>
    </div>
  );
}

// Photo Timeline Component
function PhotoTimeline({ photos, onSelectPhoto, selectedPhoto }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="headline-sm text-white">Timeline</h3>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost text-sm">
            <Grid className="w-4 h-4" />
          </button>
          <button className="btn btn-ghost text-sm">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => onSelectPhoto(photo)}
            className={`flex-shrink-0 text-left transition-all duration-200 ${
              selectedPhoto?.id === photo.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="w-20 h-24 rounded-xl overflow-hidden border border-gray-700 mb-2">
              <img 
                src={photo.poses[0]?.url || '/api/placeholder/80/96'} 
                alt={photo.date}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-white text-xs font-medium">
              {new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-gray-400 text-xs">
              {photo.poses.filter(p => p.uploaded).length}/4 poses
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Pose Upload Grid Component
function PoseUploadGrid({ poses, onUpload, onDelete }) {
  return (
    <div className="card">
      <h3 className="headline-sm text-white mb-4">Today's Poses</h3>
      <div className="grid grid-cols-2 gap-4">
        {poses.map((pose) => (
          <div key={pose.key} className="space-y-2">
            <p className="text-gray-300 text-sm font-medium">{pose.label}</p>
            <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/50 relative overflow-hidden">
              {pose.uploaded ? (
                <div className="relative">
                  <img 
                    src={pose.url} 
                    alt={pose.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onDelete(pose.key)}
                      className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => onUpload(pose.key)}
                  className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">Add Photo</span>
                </button>
              )}
            </div>
            <p className="text-gray-500 text-xs text-center">{pose.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress Insights Component
function ProgressInsights({ photos }) {
  if (photos.length < 2) return null;
  
  const latest = photos[0];
  const previous = photos[1];
  const daysDiff = Math.ceil((new Date(latest.date).getTime() - new Date(previous.date).getTime()) / (1000 * 60 * 60 * 24));
  const weightChange = latest.weight - previous.weight;
  const bodyFatChange = latest.bodyFat - previous.bodyFat;

  return (
    <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-green-400" />
        <h3 className="headline-sm text-white">Progress Insights</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Time Progress</span>
          <span className="text-white font-medium">{daysDiff} days</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Weight Change</span>
          <span className={`font-medium ${weightChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {weightChange < 0 ? '-' : '+'}{Math.abs(weightChange).toFixed(1)} lbs
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Body Fat Change</span>
          <span className={`font-medium ${bodyFatChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {bodyFatChange < 0 ? '-' : '+'}{Math.abs(bodyFatChange).toFixed(1)}%
          </span>
        </div>
        
        <div className="pt-3 border-t border-gray-700">
          <p className="text-gray-300 text-sm mb-2">AI Analysis</p>
          <p className="text-white text-sm">
            {weightChange < 0 && bodyFatChange < 0 
              ? "Excellent progress! You're losing fat while maintaining muscle mass."
              : "Keep consistent with your nutrition and training for better results."
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
        <Camera className="w-12 h-12 text-green-400" />
      </div>
      
      <h3 className="headline-md text-white mb-3">Start Your Visual Journey</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Track your transformation with progress photos. The scale doesn't tell the whole story - photos do.
      </p>
      
      <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto mb-8">
        {POSES.map((pose, index) => (
          <div key={pose.key} className="text-center">
            <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-1">
              <span className="text-gray-400 font-bold">{index + 1}</span>
            </div>
            <p className="text-gray-500 text-xs">{pose.label}</p>
          </div>
        ))}
      </div>
      
      <button className="btn btn-primary">
        <Camera className="w-4 h-4" />
        Take First Photos
      </button>
    </div>
  );
}

// Main Progress Photos Component
function ProgressPhotosV2() {
  const [photos, setPhotos] = useState(mockPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0]);
  const [viewMode, setViewMode] = useState('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpload = (poseKey) => {
    // Simulate photo upload
    console.log(`Uploading photo for pose: ${poseKey}`);
  };

  const handleDelete = (poseKey) => {
    // Simulate photo deletion
    console.log(`Deleting photo for pose: ${poseKey}`);
  };

  const handleCreateCheckpoint = () => {
    setShowUpload(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading Progress Photos...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-base-0">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-base-0/80 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="display-sm text-white mb-1">Progress Photos</h1>
                <p className="text-gray-400">Document your transformation</p>
              </div>
              <Link to="/dashboard" className="btn btn-ghost">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          <EmptyState />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-0">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-base-0/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="display-sm text-white mb-1">Progress Photos</h1>
              <p className="text-gray-400">Track your visual transformation</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleCreateCheckpoint} className="btn btn-primary">
                <Camera className="w-4 h-4" />
                New Checkpoint
              </button>
              <Link to="/dashboard" className="btn btn-ghost">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Comparison */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPhoto && photos.length > 1 && (
              <ComparisonSlider
                beforePhoto={photos[1]?.poses[0]?.url}
                afterPhoto={selectedPhoto.poses[0]?.url}
                beforeDate={new Date(photos[1].date).toLocaleDateString()}
                afterDate={new Date(selectedPhoto.date).toLocaleDateString()}
              />
            )}
            
            {selectedPhoto && (
              <PoseUploadGrid 
                poses={POSES.map(pose => ({
                  ...pose,
                  uploaded: selectedPhoto.poses.some(p => p.type === pose.key && p.uploaded),
                  url: selectedPhoto.poses.find(p => p.type === pose.key)?.url
                }))}
                onUpload={handleUpload}
                onDelete={handleDelete}
              />
            )}
          </div>

          {/* Right Column - Timeline & Insights */}
          <div className="space-y-6">
            <PhotoTimeline 
              photos={photos} 
              onSelectPhoto={setSelectedPhoto}
              selectedPhoto={selectedPhoto}
            />
            
            <ProgressInsights photos={photos} />
            
            {selectedPhoto && (
              <div className="card">
                <h3 className="headline-sm text-white mb-4">Checkpoint Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Date</span>
                    <span className="text-white font-medium">
                      {new Date(selectedPhoto.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Weight</span>
                    <span className="text-white font-medium">{selectedPhoto.weight} lbs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Body Fat</span>
                    <span className="text-white font-medium">{selectedPhoto.bodyFat}%</span>
                  </div>
                  {selectedPhoto.notes && (
                    <div className="pt-3 border-t border-gray-700">
                      <p className="text-gray-300 text-sm mb-2">Notes</p>
                      <p className="text-white text-sm">{selectedPhoto.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProgressPhotosV2;
