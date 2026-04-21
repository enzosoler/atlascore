/**
 * V3SharePR - Personal record sharing with real export functionality.
 * 
 * Connects S21_Share_Card to actual sharing services and provides
 * image export, social sharing, and link generation.
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import html2canvas from 'html2canvas';
import S21_Share_Card from '../screens/S21_Share_Card.jsx';

export default function V3SharePR() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const t = useT();
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // Get PR data from navigation state or use demo data
  const locationState = window.history?.state?.usr;
  const prData = locationState?.prData || {
    lift: 'Deadlift',
    weight: '415',
    reps: '1',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' }).toUpperCase(),
    e1rm: '415',
    rpe: '9.0',
    bodyweight: '182',
    improvement: '+10',
    days: '58'
  };

  async function handleExport(format) {
    if (!cardRef.current) {
      toast.error(t('sharePR.cardNotReady'));
      return;
    }

    setIsExporting(true);
    try {
      if (format === 'image') {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2,
          logging: false,
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) return;
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${prData.lift.replace(/\s+/g, '_')}_PR_${prData.weight}lb.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast.success(t('sharePR.imageSaved'));
        }, 'image/png');
      } else if (format === 'pdf') {
        // PDF export would require additional library like jsPDF
        toast.info(t('sharePR.pdfComingSoon'));
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('sharePR.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  }

  async function handleShare(platform) {
    try {
      const shareText = `New PR: ${prData.lift} ${prData.weight} lb × ${prData.reps}!`;
      const shareUrl = `${window.location.origin}/app/workouts/records`;
      
      if (platform === 'instagram') {
        // Instagram doesn't support direct sharing, so we save the image
        await handleExport('image');
        toast.success(t('sharePR.instagramSaved'));
      } else if (platform === 'general') {
        if (navigator.share) {
          await navigator.share({
            title: `${prData.lift} Personal Record`,
            text: shareText,
            url: shareUrl
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          toast.success(t('sharePR.shareCopied'));
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        toast.error(t('sharePR.shareFailed'));
      }
    }
  }

  async function handleCopyLink() {
    try {
      const shareUrl = `${window.location.origin}/app/workouts/records`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('sharePR.linkCopied'));
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error(t('sharePR.copyFailed'));
    }
  }

  function handleClose() {
    navigate(-1);
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: theme === 'dark' ? '#0a0a0a' : '#efe9da',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        height: '100%',
        maxHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div ref={cardRef} style={{ flex: 1 }}>
          <S21_Share_Card
            dark={theme === 'dark'}
            prData={prData}
            onClose={handleClose}
            onExport={handleExport}
            onShare={handleShare}
            onCopyLink={handleCopyLink}
            theme="dark"
          />
        </div>
        
        {isExporting && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: theme === 'dark' ? '#0a0a0a' : '#efe9da',
            color: theme === 'dark' ? '#efe9da' : '#0a0a0a',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>{t('sharePR.exporting')}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{t('sharePR.pleaseWait')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
