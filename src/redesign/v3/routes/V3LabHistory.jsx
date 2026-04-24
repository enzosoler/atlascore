import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S79_Lab_History from '../screens/S79_Lab_History.jsx';
import { listExams, summarizeExam } from '@/services/labExamService';

export default function V3LabHistory() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [exams, setExams] = React.useState([]);

  React.useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setExams([]);
      return () => {
        cancelled = true;
      };
    }

    listExams(user.id)
      .then((rows) => {
        if (!cancelled) setExams(rows.map(summarizeExam));
      })
      .catch((error) => {
        console.error('[V3LabHistory] failed to load history:', error);
        if (!cancelled) setExams([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <S79_Lab_History
      dark={theme === 'dark'}
      exams={exams}
      onUpload={() => navigate('/app/labs/upload')}
      onOpenExam={(id) => navigate(`/app/labs/exam/${id}`)}
      onBack={() => navigate('/app/labs')}
    />
  );
}
