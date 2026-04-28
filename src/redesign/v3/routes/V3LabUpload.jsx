import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { useAIConsent } from '../lib/useAIConsent.js';
import S77_Lab_Upload from '../screens/S77_Lab_Upload.jsx';
import { uploadAndProcessExam } from '@/services/labExamService';
import { ACFonts, useACT } from '../lib/paper.jsx';

export default function V3LabUpload() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const t = useT();
  const { consented, grant: grantConsent } = useAIConsent({
    userId: user?.id,
    kind: 'lab_pdf',
    provider: 'Google Gemini or another third-party AI model',
  });
  const dark = theme === 'dark';
  const c = useACT(dark);

  // handleSubmit must be defined before any early returns (rules of hooks)
  const handleSubmit = React.useCallback(
    async (file, options) => {
      if (!user?.id) {
        throw new Error('You need to be signed in to upload labs.');
      }

      const result = await uploadAndProcessExam(user.id, file, options);
      if (result.status === 'pending') {
        toast(result.pendingMessage, { duration: 5000 });
      }
      return {
        examId: result.exam.id,
        biomarkerCount: result.biomarkerCount,
        status: result.status,
        pendingMessage: result.pendingMessage,
      };
    },
    [user?.id],
  );

  // Blocking consent gate — must be granted before AI lab PDF parsing
  if (!consented) {
    return (
      <div style={{
        minHeight: '100vh', background: c.bg, color: c.fg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12, color: c.fg }}>
          {t('labs.upload.consent.title')}
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: c.dim, maxWidth: 360, marginBottom: 32, fontFamily: ACFonts.body }}>
          {t('labs.upload.consent.body')}
        </p>
        <button
          type="button"
          onClick={() => {
            grantConsent().catch((error) => {
              console.error('[V3LabUpload] consent save failed', error);
              toast.error(t('labs.upload.consent.error'));
            });
          }}
          style={{
            padding: '14px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontSize: 16, fontWeight: 600, marginBottom: 12, width: '100%', maxWidth: 320,
            background: dark ? '#fff' : '#111', color: dark ? '#111' : '#fff',
            fontFamily: ACFonts.body,
          }}
        >
          {t('labs.upload.consent.accept')}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            padding: '14px 28px', borderRadius: 12, border: `1px solid ${c.hair}`,
            cursor: 'pointer', fontSize: 16, fontWeight: 500, width: '100%', maxWidth: 320,
            background: 'transparent', color: c.fg, fontFamily: ACFonts.body,
          }}
        >
          {t('labs.upload.consent.decline')}
        </button>
      </div>
    );
  }

  return (
    <S77_Lab_Upload
      dark={theme === 'dark'}
      onCancel={() => navigate('/app/labs')}
      onSubmit={handleSubmit}
      onViewResults={(examId) => {
        if (!examId) {
          navigate('/app/labs');
          return;
        }
        navigate(`/app/labs/exam/${examId}`);
      }}
    />
  );
}
