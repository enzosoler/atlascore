import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S78_Lab_Exam_Detail from '../screens/S78_Lab_Exam_Detail.jsx';
import { getExam } from '@/services/labExamService';

function toExamView(exam) {
  const total = exam.markers.length;
  return {
    id: exam.id,
    name: exam.panel_name || 'Lab panel',
    date: exam.exam_date || new Date().toISOString().slice(0, 10),
    source: exam.status === 'pending' ? 'Parsing pending' : 'Atlas',
    provider: exam.status === 'pending' ? 'Awaiting biomarker extraction' : null,
    summary:
      exam.status === 'pending'
        ? 'Upload stored and queued for parsing'
        : `${total} biomarker${total === 1 ? '' : 's'} analyzed`,
  };
}

function toCoachSummary(exam) {
  if (exam.status === 'pending') {
    return {
      title: 'Parsing is still running',
      body: 'Your report is stored safely. Parsing usually takes 1-2 minutes, and Atlas will surface biomarkers here as soon as extraction is ready.',
    };
  }

  if (!exam.ai_insights) return null;
  return {
    title: 'Coach summary',
    body: exam.ai_insights,
  };
}

export default function V3LabExamDetail() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { id } = useParams();
  const [exam, setExam] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    if (!user?.id || !id) return () => {
      cancelled = true;
    };

    getExam(user.id, id)
      .then((row) => {
        if (!cancelled) setExam(row);
      })
      .catch((error) => {
        console.error('[V3LabExamDetail] failed to load exam:', error);
        if (!cancelled) {
          toast.error('Could not load this lab panel.');
          navigate('/app/labs/history');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, navigate, user?.id]);

  const displayExam =
    exam ||
    {
      id: id || 'loading',
      panel_name: 'Lab panel',
      exam_date: new Date().toISOString().slice(0, 10),
      markers: [],
      status: 'pending',
      ai_insights: null,
    };

  return (
    <S78_Lab_Exam_Detail
      dark={theme === 'dark'}
      exam={toExamView(displayExam)}
      biomarkers={displayExam.markers}
      coachSummary={toCoachSummary(displayExam)}
      onBack={() => navigate('/app/labs/history')}
      onAsk={() => toast('Coach review for labs is not wired yet.')}
      onShare={() => toast('Lab sharing is not wired yet.')}
    />
  );
}
