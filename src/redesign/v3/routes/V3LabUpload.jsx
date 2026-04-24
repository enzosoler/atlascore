import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S77_Lab_Upload from '../screens/S77_Lab_Upload.jsx';
import { uploadAndProcessExam } from '@/services/labExamService';

export default function V3LabUpload() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

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
