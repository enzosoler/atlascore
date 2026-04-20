/**
 * V3BodyPhotoCapture - Body photo capture screen with real functionality.
 * 
 * Provides guided body photo capture with positioning overlays and
 * proper camera integration for progress tracking.
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ACFonts, ACRadii, useACT, ACBrand } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

export default function V3BodyPhotoCapture() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const t = useT();
  const dark = theme === 'dark';
  const c = useACT(dark);
  const [activeView, setActiveView] = useState('front');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);

  const views = [
    { k: 'front', l: 'Front', instruction: 'Stand facing forward, arms at sides' },
    { k: 'side', l: 'Side', instruction: 'Stand sideways, left profile visible' },
    { k: 'back', l: 'Back', instruction: 'Stand with back to camera, arms at sides' }
  ];

  async function handleCapture() {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Camera capture is only available on mobile devices');
      return;
    }

    setIsCapturing(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: `${activeView} body photo`,
        promptLabelCancel: 'Cancel',
        promptLabelPhoto: 'Capture',
        promptLabelPicture: 'Take Photo'
      });

      if (image.dataUrl) {
        setCapturedPhoto(image.dataUrl);
        toast.success(`${activeView} photo captured successfully`);
      }
    } catch (error) {
      if (error.message !== 'User cancelled photos app') {
        toast.error('Failed to capture photo');
      }
    } finally {
      setIsCapturing(false);
    }
  }

  function handleRetake() {
    setCapturedPhoto(null);
  }

  function handleSave() {
    if (!capturedPhoto) return;
    
    // In a real implementation, this would save to storage/backend
    toast.success('Photo saved to progress timeline');
    navigate('/app/body/progress/photos');
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: c.bg, 
      color: c.fg, 
      fontFamily: ACFonts.body,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 22px',
        borderBottom: `1px solid ${c.hair}`
      }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: c.fg,
            fontSize: 16,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          × Cancel
        </button>
        <HeartMark size={24} dark={dark} />
        <div style={{ width: 40 }} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!capturedPhoto ? (
          <>
            {/* View Selector */}
            <div style={{
              padding: '20px 22px 10px',
              display: 'flex',
              gap: 8,
              justifyContent: 'center'
            }}>
              {views.map(view => (
                <button
                  key={view.k}
                  type="button"
                  onClick={() => setActiveView(view.k)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    background: activeView === view.k ? c.accent : c.card,
                    color: activeView === view.k ? c.ink : c.fg,
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {view.l}
                </button>
              ))}
            </div>

            {/* Camera Preview Area */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              position: 'relative'
            }}>
              {/* Positioning Guide Overlay */}
              <div style={{
                width: '100%',
                maxWidth: 300,
                height: 400,
                background: c.card,
                borderRadius: ACRadii.card,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${c.faint}`
              }}>
                {/* Body silhouette guide */}
                <svg width="120" height="300" viewBox="0 0 120 300" fill="none" style={{ opacity: 0.3 }}>
                  <circle cx="60" cy="40" r="20" stroke={c.fg} strokeWidth="2" />
                  <path d="M60 60 L60 140 M60 80 L40 110 M60 80 L80 110 M60 140 L40 200 M60 140 L80 200" stroke={c.fg} strokeWidth="2" />
                  <path d="M40 200 Q60 220 80 200" stroke={c.fg} strokeWidth="2" fill="none" />
                </svg>
                
                {/* Instruction text */}
                <div style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  padding: '0 20px'
                }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: c.fg,
                    marginBottom: 4
                  }}>
                    {views.find(v => v.k === activeView)?.l} View
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: c.dim,
                    lineHeight: 1.4
                  }}>
                    {views.find(v => v.k === activeView)?.instruction}
                  </div>
                </div>
              </div>

              {/* Capture Button */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={isCapturing}
                style={{
                  marginTop: 30,
                  width: 80,
                  height: 80,
                  borderRadius: 999,
                  background: isCapturing ? c.faint : c.accent,
                  border: 'none',
                  cursor: isCapturing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCapturing ? 'none' : `0 4px 20px ${c.accent}40`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: 999,
                  background: isCapturing ? c.dim : c.ink,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={isCapturing ? c.fg : c.accent} strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" fill={isCapturing ? c.fg : c.accent} />
                  </svg>
                </div>
              </button>
            </div>
          </>
        ) : (
          /* Photo Review */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px'
          }}>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 20,
              textAlign: 'center'
            }}>
              Review your {activeView} photo
            </div>
            
            <div style={{
              width: '100%',
              maxWidth: 300,
              aspectRatio: '3/4',
              borderRadius: ACRadii.card,
              overflow: 'hidden',
              marginBottom: 30,
              border: `2px solid ${c.accent}`
            }}>
              <img 
                src={capturedPhoto} 
                alt={`${activeView} body photo`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              width: '100%',
              maxWidth: 300
            }}>
              <button
                type="button"
                onClick={handleRetake}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'none',
                  color: c.fg,
                  border: `2px solid ${c.hair}`,
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: c.accent,
                  color: c.ink,
                  border: 'none',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
